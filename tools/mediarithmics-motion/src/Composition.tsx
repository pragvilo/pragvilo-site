import React from 'react';
import {AbsoluteFill, Composition, Easing, Interactive, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';

const palette = ['#00A1DF', '#FF5959', '#00AD68', '#F58D39'];
const ease = Easing.bezier(.2, 0, .2, 1);
const progress = (frame: number, from: number, to: number) => interpolate(frame, [from, to], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease});

function Person({x, y, color = '#EAF1FA', scale = 1}: {x: number; y: number; color?: string; scale?: number}) {
  return <g transform={`translate(${x} ${y}) scale(${scale})`} fill="none" stroke={color} strokeWidth="2.6" strokeLinecap="round"><circle cy="-8" r="8"/><path d="M-15 19v-3a15 15 0 0 1 30 0v3"/></g>;
}

function Icon({type, x, y, color}: {type: string; x: number; y: number; color: string}) {
  return <g transform={`translate(${x} ${y})`} stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
    {type === 'website' ? <><rect x="-17" y="-13" width="34" height="24" rx="3"/><path d="M-6 18H6M0 11v7M-17-5h34"/></> : type === 'store' ? <><path d="M-17-5h34l-4-10h-26zM-14-1v17h28V-1M-5 16V4H5v12"/></> : type === 'email' ? <><rect x="-18" y="-12" width="36" height="26" rx="3"/><path d="m-17-11 17 13 17-13"/></> : type === 'video' ? <><rect x="-19" y="-14" width="38" height="28" rx="4"/><path d="m-4-7 11 7-11 7z"/></> : type === 'ads' ? <><rect x="-17" y="-16" width="34" height="32" rx="3"/><path d="M-9-8H9M-9-1H3m-3 4 11 7-7 1-2 6z"/></> : <Person x={0} y={0} color={color}/>}
  </g>;
}

function Contours({frame, x, y}: {frame: number; x: number; y: number}) {
  return <g transform={`translate(${x} ${y}) rotate(-18)`} fill="none" opacity=".8">
    {Array.from({length: 18}, (_, i) => <ellipse key={i} rx={84 + i * 5} ry={58 + i * 4.8} stroke={palette[Math.floor(i / 5) % 4]} strokeWidth="1.3" transform={`rotate(${Math.sin(frame / 50) * 3})`}/>) }
  </g>;
}

function SceneTitle({children}: {children: React.ReactNode}) {
  const frame = useCurrentFrame();
  return <Interactive.Div style={{position: 'absolute', left: 24, right: 24, top: 380, color: '#EAF1FA', fontSize: 36, lineHeight: 1.1, fontWeight: 550, letterSpacing: '-.04em', textAlign: 'center', opacity: progress(frame, 0, 6)}}>{children}</Interactive.Div>;
}

export function Identity() {
  const frame = useCurrentFrame();
  return <AbsoluteFill>
    <svg viewBox="0 0 720 440" style={{width: '100%', height: '100%'}}>
      <Contours x={523} y={208} frame={frame}/>
      {['Website', 'CRM', 'Store'].map((label, i) => {
        const y = 76 + i * 105;
        const t = interpolate(frame, [8 + i * 8, 65 + i * 8], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
        return <g key={label}>
          <path d={`M224 ${y + 32}C330 ${y + 32} 328 208 440 208`} stroke={palette[i]} fill="none" strokeWidth="2" opacity=".75"/>
          <circle cx={224 + 216 * t} cy={(y + 32) + (208 - y - 32) * (t * t * (3 - 2 * t))} r="5" fill={palette[i]} opacity={frame < 90 ? 1 : 0}/>
          <rect x="24" y={y} width="200" height="64" rx="12" fill="#0A2450" stroke="#3A5C8F"/>
          <Icon type={['website', 'person', 'store'][i]} x={58} y={y + 31} color={palette[i]}/>
          <text x="91" y={y + 42} fill="#EAF1FA" fontSize="29" fontWeight="500">{label}</text>
        </g>;
      })}
      <Interactive.G><rect x="440" y="127" width="166" height="162" rx="12" fill="#061E44" stroke="#9FB3CD" strokeWidth="1.4"/><circle cx="523" cy="185" r="32" fill="#0E3268"/><Person x={523} y={182}/><text x="523" y="245" fill="#EAF1FA" textAnchor="middle" fontSize="27">Customer</text><path d="M488 268h20" stroke="#00A1DF" strokeWidth="4"/><path d="M513 268h20" stroke="#FF5959" strokeWidth="4"/><path d="M538 268h20" stroke="#00AD68" strokeWidth="4"/></Interactive.G>
    </svg>
    <SceneTitle>Every signal. One customer.</SceneTitle>
  </AbsoluteFill>;
}

// Three permanent editing units. Only their emphasis changes, never their visibility.
function JourneyCard({kind, focus}: {kind: 'identity' | 'audience' | 'campaign'; focus: number}) {
  const color = kind === 'identity' ? '#00A1DF' : kind === 'audience' ? '#FF5959' : '#00AD68';
  return <>
    <rect x="-95" y="-132" width="190" height="264" rx="12" fill="#0A2450" stroke="#3A5C8F" strokeWidth="1.4"/>
    <rect x="-95" y="-132" width="190" height="264" rx="12" fill="none" stroke={color} strokeWidth="2.4" opacity={focus}/>
    <text y="-90" textAnchor="middle" fill="#EAF1FA" fontSize="29" fontWeight="550" letterSpacing="-.7">{kind === 'identity' ? 'Identity' : kind === 'audience' ? 'Audience' : 'Campaign'}</text>
    {kind === 'identity' ? <>
      <path d="M-46-36Q-46-12 0 0M0-36V0M46-36Q46-12 0 0" fill="none" stroke="#3A5C8F" strokeWidth="2"/>
      <g opacity={.65 + focus * .35}>
        <circle cx="-46" cy="-44" r="17" fill="#093058"/><Icon type="website" x={-46} y={-44} color="#00A1DF"/>
        <circle cy="-44" r="17" fill="#093058"/><g transform="translate(0 -44) scale(.65)"><Person x={0} y={0} color="#00A1DF"/></g>
        <circle cx="46" cy="-44" r="17" fill="#093058"/><g transform="translate(46 -44) scale(.7)"><Icon type="store" x={0} y={0} color="#00A1DF"/></g>
      </g>
      <circle cy="23" r="37" fill="#0E3268" stroke="#00A1DF" strokeWidth="1.5"/><Person x={0} y={20} scale={1.25}/>
      <circle cx="27" cy="49" r="11" fill="#00A1DF"/><path d="m22 49 4 4 7-8" stroke="#061E44" strokeWidth="2.4" fill="none"/>
      <text y="94" fill="#9FB3CD" textAnchor="middle" fontSize="24">One customer<tspan x="0" dy="28">view</tspan></text>
    </> : kind === 'audience' ? <>
      {Array.from({length:6},(_,i) => <g key={i} transform={`translate(${-48 + i % 3 * 48} ${-28 + Math.floor(i / 3) * 53})`}>
        <circle r="22" fill={[0,2,4].includes(i) ? '#FF5959' : '#093058'} stroke={[0,2,4].includes(i) ? '#FF5959' : '#3A5C8F'} opacity={[0,2,4].includes(i) ? .72 + focus * .28 : .65}/>
        <Person x={0} y={-2} scale={.65} color={[0,2,4].includes(i) ? '#061E44' : '#9FB3CD'}/>
      </g>)}
      <path d="M-53 61H53" stroke="#FF5959" strokeWidth="2" strokeLinecap="round"/>
      <text y="94" fill="#9FB3CD" textAnchor="middle" fontSize="24">People who<tspan x="0" dy="28">matter</tspan></text>
    </> : <>
      <rect x="-56" y="-53" width="112" height="85" rx="8" fill="#0E3268" stroke="#00AD68" strokeWidth="1.5"/>
      <path d="M-42-36H-12M-42-24H8" stroke="#9FB3CD" strokeWidth="3" strokeLinecap="round"/>
      <circle cx="28" cy="2" r="23" fill="#00AD68"/>
      <path d="m16 2 11-12 13 12m-13-12v25" stroke="#061E44" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round" transform="rotate(90 28 2)"/>
      <g transform="translate(-41 57) scale(.62)"><Icon type="email" x={0} y={0} color="#00AD68"/></g>
      <g transform="translate(0 57) scale(.62)"><Icon type="ads" x={0} y={0} color="#00AD68"/></g>
      <g transform="translate(41 57) scale(.62)"><Icon type="video" x={0} y={0} color="#00AD68"/></g>
      <text y="94" fill="#9FB3CD" textAnchor="middle" fontSize="24">Ready to<tspan x="0" dy="28">reach</tspan></text>
    </>}
  </>;
}

export function Journey() {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const focus = (values: number[]) => interpolate(frame, [0, 4 * fps - 7, 4 * fps, 8 * fps - 7, 8 * fps, 12 * fps - 7, 12 * fps - 1], values, {extrapolateLeft:'clamp',extrapolateRight:'clamp',easing:ease});
  const identity = focus([1,1,0,0,0,0,1]);
  const audience = focus([0,0,1,1,0,0,0]);
  const campaign = focus([0,0,0,0,1,1,0]);
  return <AbsoluteFill style={{fontFamily:'"DM Sans", sans-serif'}}>
    <svg viewBox="0 0 720 400" width="720" height="400">
      <path d="M188 200H532" stroke="#3A5C8F" strokeWidth="2"/>
      <path d="m236 193 8 7-8 7m236-14 8 7-8 7" stroke="#9FB3CD" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      <g transform="translate(124 200)"><Interactive.G name="Identity · one customer view" style={{scale:.94 + identity * .17}}><JourneyCard kind="identity" focus={identity}/></Interactive.G></g>
      <g transform="translate(360 200)"><Interactive.G name="Audience · people who matter" style={{scale:.94 + audience * .17}}><JourneyCard kind="audience" focus={audience}/></Interactive.G></g>
      <g transform="translate(596 200)"><Interactive.G name="Campaign · ready to reach" style={{scale:.94 + campaign * .17}}><JourneyCard kind="campaign" focus={campaign}/></Interactive.G></g>
    </svg>
  </AbsoluteFill>;
}

export const MyComposition = () => <Composition id="CustomerJourney" component={Journey} durationInFrames={360} fps={30} width={720} height={400} defaultProps={{}}/>;
