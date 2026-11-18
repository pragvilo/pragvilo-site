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
function MotionButton() {
  const enabled = useSyncExternalStore(subscribe, snapshot);
  return <button type="button" className="icon-button motion-toggle" title={enabled ? 'Pause all animations' : 'Play all animations'} aria-label={enabled ? 'Pause all animations' : 'Play all animations'} onClick={() => setMotion(!enabled)}>
    <svg className="icon" aria-hidden="true"><use href={enabled ? '#pause' : '#play'}/></svg><span className="sr-only">{enabled ? 'Pause all animations' : 'Play all animations'}</span>
  </button>;
}

const configurations = {
  hero: {component: Journey, width:720, height:440, duration:480},
  identity: {component: IdentityLoop, width:720, height:440, duration:120},
  audience: {component: AudienceFlow, width:600, height:110, duration:450},
  retail: {component: RetailFlow, width:720, height:440, duration:360},
  art: {component: AmbientArtwork, width:720, height:400, duration:240},
};
type Kind = keyof typeof configurations;
const audienceSteps = ['request','rules','created'];

function AutoPlayer({kind, host, source}: {kind: Kind; host: HTMLElement; source?: string}) {
  const ref = useRef<PlayerRef>(null);
  const enabled = useSyncExternalStore(subscribe, snapshot);
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
    const target = demo?.querySelector<HTMLElement>('.agent-console') || host;
    let lastStage = -1;
    sync.current = () => {
      gate.current.documentVisible = !document.hidden;
      gate.current.dialogOpen = !!document.querySelector('dialog[open]');
      const play = shouldPlay(gate.current);
      host.dataset.playing = String(play);
      if (play && !p.isPlaying()) p.play();
      else if (!play && p.isPlaying()) p.pause();
    };
    const threshold = .2;
    const observer = new IntersectionObserver(([entry]) => {
      gate.current.visible = entry.isIntersecting && entry.intersectionRatio >= threshold;
      sync.current();
    }, {threshold:[0,threshold]});
    observer.observe(target);
    // Hidden sector panels can become visible without changing the page scroll.
    const onContext = () => sync.current();
    const hold = () => {gate.current.interacting = true; sync.current();};
    const release = (event: FocusEvent) => {
      if (demo?.querySelector<HTMLElement>('.agent-console')?.contains(event.relatedTarget as Node | null)) return;
      gate.current.interacting = false; sync.current();
    };
    const manualState = () => {p.seekTo(0); };
    const onFrame: CallbackListener<'frameupdate'> = ({detail}) => {
      // A visible diagnostic marker also makes automated playback verifiable.
      if (detail.frame % 15 === 0) host.dataset.frame = String(detail.frame);
      const next = kind === 'audience' ? Math.floor(detail.frame / 150) : Math.floor(detail.frame / 120);
      if (next === lastStage) return;
      lastStage = next;
      if (demo && !gate.current.interacting) demo.dispatchEvent(new CustomEvent('mics:audience-tick',{detail:audienceSteps[next]}));
    };
    const fail = () => {setFailed(true); if (fallback) fallback.hidden = false; delete host.dataset.ready;};
    p.addEventListener('frameupdate',onFrame);
    p.addEventListener('error',fail);
    document.addEventListener('visibilitychange',onContext);
    document.addEventListener('mics:dialog',onContext);
    // Preserve keyboard focus and a visitor's edits; automatic scenes never submit or click controls.
    demo?.querySelector<HTMLElement>('.agent-console')?.addEventListener('focusin',hold);
    demo?.querySelector<HTMLElement>('.agent-console')?.addEventListener('focusout',release);
    demo?.addEventListener('mics:audience-manual',manualState);
    return () => {
      observer.disconnect(); p.removeEventListener('frameupdate',onFrame); p.removeEventListener('error',fail);
      document.removeEventListener('visibilitychange',onContext); document.removeEventListener('mics:dialog',onContext);
      demo?.querySelector<HTMLElement>('.agent-console')?.removeEventListener('focusin',hold);
      demo?.querySelector<HTMLElement>('.agent-console')?.removeEventListener('focusout',release);
      demo?.removeEventListener('mics:audience-manual',manualState);
    };
  }, [host,kind]);
  useEffect(() => {gate.current.enabled = enabled; sync.current();}, [enabled]);
  if (failed) return null;
  return <div className={'auto-player auto-player--' + kind}>
    <div aria-hidden="true" className="motion-canvas" style={{aspectRatio:config.width + '/' + config.height}}>
      <Player ref={ref} component={config.component} inputProps={{source}} durationInFrames={config.duration} compositionWidth={config.width} compositionHeight={config.height} fps={30} initialFrame={kind === 'hero' ? (enabled ? 0 : 440) : kind === 'identity' ? 30 : 0} controls={false} autoPlay={false} initiallyMuted loop moveToBeginningWhenEnded={false} clickToPlay={false} doubleClickToFullscreen={false} spaceKeyToPlayOrPause={false} numberOfSharedAudioTags={0} style={{width:'100%',height:'100%'}}/>
    </div>


  </div>;
}

const hero = document.getElementById('journey-player');
if (hero) createRoot(hero).render(<AutoPlayer kind="hero" host={hero}/>);
document.querySelectorAll<HTMLElement>('[data-motion-kind]').forEach(host => {
  const kind = host.dataset.motionKind as Kind;
  if (kind in configurations) createRoot(host).render(<AutoPlayer kind={kind} host={host} source={host.dataset.motionSource}/>);
});
document.querySelectorAll('[data-motion-switch]').forEach(host => createRoot(host).render(<MotionButton/>));
