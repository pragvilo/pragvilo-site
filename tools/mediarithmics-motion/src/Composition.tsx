import React from 'react';
import {AbsoluteFill, Composition, Easing, Interactive, interpolate, useCurrentFrame} from 'remotion';

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

export {Journey} from './Journey';
import {Journey} from './Journey';

export const MyComposition = () => <Composition id="CustomerJourney" component={Journey} durationInFrames={480} fps={30} width={720} height={440} defaultProps={{}}/>;
