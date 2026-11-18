import {useEffect, useRef, useState, useSyncExternalStore} from 'react';
import {createRoot} from 'react-dom/client';
import {Player, type PlayerRef, type CallbackListener} from '@remotion/player';
import {Journey} from './Composition';
import {IdentityLoop, AudienceFlow, RetailFlow, AmbientArtwork} from './Scenes';
import {motionAllowed, shouldPlay} from './playback';

const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
let choice: boolean | null = null;
const subscribers = new Set<() => void>();
const snapshot = () => motionAllowed(choice, preference.matches);
const subscribe = (listener: () => void) => {subscribers.add(listener); return () => {subscribers.delete(listener);};};
const notify = () => subscribers.forEach(listener => listener());
preference.addEventListener('change', () => {if (preference.matches) choice = null; notify();});
function setMotion(enabled: boolean) {choice = enabled; notify();}
function MotionButton({compact = false}: {compact?: boolean}) {
  const enabled = useSyncExternalStore(subscribe, snapshot);
  return <button type="button" className={compact ? 'icon-button art-play' : 'motion-toggle'} aria-label={enabled ? 'Pause all animations' : 'Play all animations'} onClick={() => setMotion(!enabled)}>
    <svg className="icon" aria-hidden="true"><use href={enabled ? '#pause' : '#play'}/></svg>{!compact && (enabled ? 'Pause animations' : 'Play animations')}
  </button>;
}

const configurations = {
  hero: {component: Journey, width:720, height:440, duration:360},
  identity: {component: IdentityLoop, width:720, height:440, duration:120},
  audience: {component: AudienceFlow, width:600, height:330, duration:450},
  retail: {component: RetailFlow, width:720, height:440, duration:360},
  art: {component: AmbientArtwork, width:720, height:400, duration:240},
};
type Kind = keyof typeof configurations;
const audienceSteps = ['request','rules','created'];

function AutoPlayer({kind, host, source}: {kind: Kind; host: HTMLElement; source?: string}) {
  const ref = useRef<PlayerRef>(null);
  const enabled = useSyncExternalStore(subscribe, snapshot);
  const [stage, setStage] = useState(0);
  const [held, setHeld] = useState(false);
  const [failed, setFailed] = useState(false);
  const gate = useRef({enabled, visible:false, documentVisible:!document.hidden, dialogOpen:false, interacting:false});
  const sync = useRef(() => {});
  const config = configurations[kind];
  useEffect(() => {
    const p = ref.current;
    if (!p) return;
    const fallback = host.previousElementSibling as HTMLElement | null;
    if (fallback?.hasAttribute('data-motion-fallback')) fallback.hidden = true;
    host.dataset.ready = '';
    const demo = kind === 'audience' ? document.querySelector<HTMLElement>('#audience-agent') : null;
    const target = demo?.querySelector('.agent-console') || host;
    let lastStage = -1;
    sync.current = () => {
      gate.current.documentVisible = !document.hidden;
      gate.current.dialogOpen = !!document.querySelector('dialog[open]');
      const play = shouldPlay(gate.current);
      host.dataset.playing = String(play);
      if (play && !p.isPlaying()) p.play();
      else if (!play && p.isPlaying()) p.pause();
    };
    const threshold = kind === 'audience' ? .6 : .2;
    const observer = new IntersectionObserver(([entry]) => {
      gate.current.visible = entry.isIntersecting && entry.intersectionRatio >= threshold;
      sync.current();
    }, {threshold:[0,threshold]});
    observer.observe(target);
    // Hidden sector panels can become visible without changing the page scroll.
    const onContext = () => sync.current();
    const hold = () => {gate.current.interacting = true; setHeld(true); sync.current();};
    const manualState = (event: Event) => {
      if (!gate.current.interacting) return;
      const index = audienceSteps.indexOf((event as CustomEvent<string>).detail);
      if (index >= 0) {p.seekTo(index * 150 + 90); setStage(index);}
    };
    const onFrame: CallbackListener<'frameupdate'> = ({detail}) => {
      // A visible diagnostic marker also makes automated playback verifiable.
      if (detail.frame % 15 === 0) host.dataset.frame = String(detail.frame);
      const next = kind === 'audience' ? Math.floor(detail.frame / 150) : Math.floor(detail.frame / 120);
      if (next === lastStage) return;
      lastStage = next;
      setStage(next);
      if (demo && !gate.current.interacting) demo.dispatchEvent(new CustomEvent('mics:audience-tick',{detail:audienceSteps[next]}));
    };
    const fail = () => {setFailed(true); if (fallback) fallback.hidden = false; delete host.dataset.ready;};
    p.addEventListener('frameupdate',onFrame);
    p.addEventListener('error',fail);
    document.addEventListener('visibilitychange',onContext);
    document.addEventListener('mics:dialog',onContext);
    // Preserve keyboard focus and a visitor's edits; automatic scenes never submit or click controls.
    demo?.querySelector('.agent-console')?.addEventListener('focusin',hold);
    demo?.addEventListener('mics:audience-manual',hold);
    demo?.addEventListener('mics:audience-state',manualState);
    return () => {
      observer.disconnect(); p.removeEventListener('frameupdate',onFrame); p.removeEventListener('error',fail);
      document.removeEventListener('visibilitychange',onContext); document.removeEventListener('mics:dialog',onContext);
      demo?.querySelector('.agent-console')?.removeEventListener('focusin',hold);
      demo?.removeEventListener('mics:audience-manual',hold); demo?.removeEventListener('mics:audience-state',manualState);
    };
  }, [host,kind]);
  useEffect(() => {gate.current.enabled = enabled; sync.current();}, [enabled]);
  const explore = () => {
    gate.current.interacting = true; setHeld(true); sync.current(); ref.current?.seekTo(90);
    document.querySelector('#audience-agent')?.dispatchEvent(new CustomEvent('mics:audience-tick',{detail:'request'}));
  };
  const resume = () => {
    gate.current.interacting = false; setHeld(false); setMotion(true); ref.current?.seekTo(0);
    document.querySelector('#audience-agent')?.dispatchEvent(new CustomEvent('mics:audience-tick',{detail:'request'}));
    sync.current();
  };
  if (failed) return null;
  return <div className={'auto-player auto-player--' + kind}>
    <div aria-hidden="true" className="motion-canvas" style={{aspectRatio:config.width + '/' + config.height}}>
      <Player ref={ref} component={config.component} inputProps={{source}} durationInFrames={config.duration} compositionWidth={config.width} compositionHeight={config.height} fps={30} initialFrame={kind === 'hero' || kind === 'identity' ? 30 : 0} controls={false} autoPlay={false} initiallyMuted loop moveToBeginningWhenEnded={false} clickToPlay={false} doubleClickToFullscreen={false} spaceKeyToPlayOrPause={false} numberOfSharedAudioTags={0} style={{width:'100%',height:'100%'}}/>
    </div>
    {kind === 'hero' ? <div className="art-control" role="group" aria-label="Explore the customer journey"><div className="steps">{['Identity','Audience','Campaign'].map((name,index) => <button type="button" key={name} aria-pressed={stage === index} onClick={() => ref.current?.seekTo(index * 120 + (enabled ? 0 : 90))}><span>0{index + 1}</span>{name}</button>)}</div><MotionButton compact/></div> : kind !== 'art' && <div className="motion-toolbar"><span>{kind === 'audience' ? held ? 'Explore at your pace' : enabled ? 'Automatic walkthrough' : 'Walkthrough paused' : enabled ? 'Illustrative journey · auto' : 'Illustrative journey · paused'}</span>{kind === 'audience' && held ? <button className="motion-toggle" type="button" onClick={resume}><svg className="icon" aria-hidden="true"><use href="#play"/></svg>Resume walkthrough</button> : kind === 'audience' ? <><button type="button" className="motion-toggle" onClick={explore}>Try it yourself <svg className="icon" aria-hidden="true"><use href="#arrow"/></svg></button><MotionButton/></> : <MotionButton/>}</div>}
  </div>;
}

const hero = document.getElementById('journey-player');
if (hero) createRoot(hero).render(<AutoPlayer kind="hero" host={hero}/>);
document.querySelectorAll<HTMLElement>('[data-motion-kind]').forEach(host => {
  const kind = host.dataset.motionKind as Kind;
  if (kind in configurations) createRoot(host).render(<AutoPlayer kind={kind} host={host} source={host.dataset.motionSource}/>);
});
document.querySelectorAll('[data-motion-switch]').forEach(host => createRoot(host).render(<MotionButton/>));
