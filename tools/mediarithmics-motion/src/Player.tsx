import {useEffect, useRef, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Player, type PlayerRef, type CallbackListener} from '@remotion/player';
import {Journey} from './Composition';

function JourneyPlayer() {
  const player = useRef<PlayerRef>(null);
  const container = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [stage, setStage] = useState(0);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const p = player.current;
    if (!p || !container.current) return;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let started = false;
    const onFrame: CallbackListener<'frameupdate'> = ({detail}) => setStage(Math.min(2, Math.floor(detail.frame / 120)));
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onError = () => setFailed(true);
    const pause = () => p.pause();
    const onVisibility = () => {if (document.hidden) pause();};
    const onDialog = () => {if (document.querySelector('dialog[open]')) pause();};
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) pause();
      else if (!started && !preference.matches && !document.hidden && !document.querySelector('dialog[open]')) {started = true; p.play();}
    }, {threshold: .55});
    observer.observe(container.current);
    p.addEventListener('frameupdate', onFrame);
    p.addEventListener('play', onPlay);
    p.addEventListener('pause', onPause);
    p.addEventListener('ended', onPause);
    p.addEventListener('error', onError);
    document.addEventListener('visibilitychange', onVisibility);
    document.addEventListener('mics:dialog', onDialog);
    preference.addEventListener('change', pause);
    document.querySelector('.journey-fallback')?.setAttribute('hidden', '');
    return () => {
      observer.disconnect();
      p.removeEventListener('frameupdate', onFrame); p.removeEventListener('play', onPlay); p.removeEventListener('pause', onPause); p.removeEventListener('ended', onPause); p.removeEventListener('error', onError);
      document.removeEventListener('visibilitychange', onVisibility); document.removeEventListener('mics:dialog', onDialog); preference.removeEventListener('change', pause);
    };
  }, []);
  useEffect(() => {if (failed) document.querySelector('.journey-fallback')?.removeAttribute('hidden');}, [failed]);
  if (failed) return null;
  return <div ref={container}>
    <div aria-hidden="true" className="journey-canvas">
      <Player ref={player} component={Journey} inputProps={{}} durationInFrames={360} fps={30} compositionWidth={720} compositionHeight={440} initialFrame={30} controls={false} autoPlay={false} loop={false} moveToBeginningWhenEnded={false} clickToPlay={false} doubleClickToFullscreen={false} spaceKeyToPlayOrPause={false} numberOfSharedAudioTags={0} style={{width: '100%'}}/>
    </div>
    <div className="art-control" role="group" aria-label="Explore the customer journey">
      <div className="steps">{['Identity', 'Audience', 'Campaign'].map((name, index) => <button key={name} type="button" aria-pressed={stage === index} onClick={() => {player.current?.pause(); player.current?.seekTo(index * 120 + 90);}}><span>0{index + 1}</span>{name}</button>)}</div>
      <button className="icon-button art-play" type="button" aria-label={playing ? 'Pause illustration' : 'Play illustration'} onClick={() => {
        const p = player.current;
        if (!p) return;
        if (p.isPlaying()) p.pause();
        else {if (p.getCurrentFrame() >= 358) p.seekTo(0); p.play();}
      }}><svg className="icon" aria-hidden="true"><use href={playing ? '#pause' : '#play'}/></svg></button>
    </div>
    <p className="sr-only" role="status">{['Connect website, CRM and store data into one customer view.', 'Select the people to include in your audience.', 'Activate your audience across email, ads and video.'][stage]}</p>
  </div>;
}

const root = document.getElementById('journey-player');
if (root) createRoot(root).render(<JourneyPlayer/>);
