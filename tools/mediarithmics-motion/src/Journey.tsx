import {AbsoluteFill, Easing, Interactive, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';

const ease = Easing.bezier(.2, 0, .2, 1);
const clamp = {extrapolateLeft:'clamp',extrapolateRight:'clamp'} as const;
const amount = (frame:number, start:number, end:number) => interpolate(frame,[start,end],[0,1],clamp);

function Person({color='#EAF1FA',size=1}:{color?:string;size?:number}) {
  return <g transform={`scale(${size})`} fill="none" stroke={color} strokeWidth="2.6" strokeLinecap="round"><circle cy="-8" r="8"/><path d="M-15 19v-3a15 15 0 0 1 30 0v3"/></g>;
}

// Explicit, familiar objects: a shopfront, a contact record, a video player.
function Glyph({kind,color}:{kind:string;color:string}) {
  return <g fill="none" stroke={color} strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
    {kind==='Store' ? <><path d="M-22-5h44l-5-14h-34zM-19 2v20h38V2M-8 22V7H3v15M8 7h7v8H8z"/><path d="M-22-5v4a6 6 0 0 0 11 0 6 6 0 0 0 11 0 6 6 0 0 0 11 0 6 6 0 0 0 11 0v-4M-11-19l-1 14M0-19v14m11-14 1 14"/></> : kind==='CRM' ? <><rect x="-24" y="-20" width="48" height="40" rx="5"/><circle cx="-10" cy="-6" r="5"/><path d="M-19 12v-3a9 9 0 0 1 18 0v3M5-8h11M5 0h11M5 8h7"/></> : kind==='Email' ? <><rect x="-23" y="-16" width="46" height="32" rx="4"/><path d="m-22-14 22 17 22-17"/></> : kind==='Ads' ? <><rect x="-23" y="-20" width="46" height="40" rx="4"/><path d="M-23-9h46M-15-15h1m5 0h1M-14 0H0m-14 7h8m12-9 15 10-9 2-3 9z"/></> : <><rect x="-24" y="-18" width="48" height="36" rx="5"/><path d="m-5-10 15 10-15 10z"/></>}
  </g>;
}

function Source({label,y,color,delay}:{label:string;y:number;color:string;delay:number}) {
  const frame=useCurrentFrame();
  const {fps}=useVideoConfig();
  const local=frame-delay;
  const pulse=local>=0&&local<4.2*fps ? Math.sin(amount(local,0,4.2*fps)*Math.PI) : 0;
  const t=amount(local,.3*fps,3.8*fps);
  // An exact cubic curve keeps each travelling signal on its drawn route.
  const x=(1-t)**3*139+3*(1-t)**2*t*185+3*(1-t)*t*t*178+t**3*207;
  const cy=(1-t)**3*y+3*(1-t)**2*t*y+3*(1-t)*t*t*224+t**3*224;
  return <>
    <path d={`M139 ${y}C185 ${y} 178 224 207 224`} stroke={color} strokeWidth="1.8" opacity=".35" fill="none"/>
    <path d={`M139 ${y}C185 ${y} 178 224 207 224`} stroke={color} strokeWidth="2.8" pathLength="1" strokeDasharray="1" strokeDashoffset={1-t} opacity={(.5+pulse*.5)*(1-amount(frame,15.6*fps,16*fps-1))} fill="none"/>
    <g transform={`translate(0 ${-pulse*5})`}>
      <rect x="8" y={y-43} width="130" height="86" rx="12" fill="#0A2450" stroke="#3A5C8F"/>
      <g transform={`translate(73 ${y-12})`}><Glyph kind={label} color={color}/></g>
      <text x="73" y={y+30} textAnchor="middle" fontSize="25" fontWeight="500" fill="#EAF1FA">{label}</text>
    </g>
    <circle cx={x} cy={cy} r="5" fill={color} opacity={local>.3*fps&&local<3.8*fps?1:0}/>
  </>;
}

function Customer() {
  const frame=useCurrentFrame(); const {fps}=useVideoConfig();
  const receive=amount(frame,.8*fps,4.4*fps);
  const release=1-amount(frame,15.6*fps,16*fps-1);
  return <>
    <circle cx="252" cy="224" r={44+Math.sin(receive*Math.PI)*5} fill="#0A2450" stroke="#3A5C8F" strokeWidth="1.5"/>
    <g transform="translate(252 224) rotate(-90)" opacity={release}>
      <circle r="44" fill="none" stroke="#00A1DF" strokeWidth="3" pathLength="1" strokeDasharray={`${.29*amount(frame,2.5*fps,3.8*fps)} 1`}/>
      <circle r="44" fill="none" stroke="#FF5959" strokeWidth="3" pathLength="1" strokeDasharray={`${.29*amount(frame,3*fps,4.3*fps)} 1`} strokeDashoffset="-.333"/>
      <circle r="44" fill="none" stroke="#F58D39" strokeWidth="3" pathLength="1" strokeDasharray={`${.29*amount(frame,3.5*fps,4.8*fps)} 1`} strokeDashoffset="-.666"/>
    </g>
    <g transform="translate(252 221)"><Person size={1.35}/></g>
    <g opacity={amount(frame,4.8*fps,5*fps)*release}><circle cx="284" cy="254" r="12" fill="#00A1DF"/><path d="m278 254 4 4 8-9" stroke="#061E44" strokeWidth="2.5" fill="none"/></g>
  </>;
}

function Audience() {
  const frame=useCurrentFrame(); const {fps}=useVideoConfig();
  const gathered=amount(frame,7.2*fps,8.4*fps);
  return <>
    <rect x="365" y="137" width="154" height="174" rx="12" fill="#0A2450" stroke="#3A5C8F"/>
    <rect x="365" y="137" width="154" height="174" rx="12" fill="none" stroke="#FF5959" strokeWidth="2" pathLength="1" strokeDasharray="1" strokeDashoffset={1-gathered} opacity={1-amount(frame,15.6*fps,16*fps-1)}/>
    {Array.from({length:9},(_,i)=>{
      const x=398+i%3*44; const y=176+Math.floor(i/3)*48;
      const selected=[0,2,6,8].includes(i);
      const settle=selected?Math.sin(gathered*Math.PI)*5:0;
      return <g key={i} transform={`translate(${x} ${y-settle})`}>
        <circle r={i===4?23:18} fill={i===4?'#0E3268':selected?'#093058':'#061E44'} stroke={i===4?'#00A1DF':selected&&gathered>.1?'#FF5959':'#3A5C8F'} strokeWidth={i===4?2:1.4}/>
        <g opacity={i===4?amount(frame,6.8*fps,7.1*fps)*(1-amount(frame,15.6*fps,16*fps-1)):1}><Person size={i===4?.8:.57} color={i===4?'#00A1DF':selected&&gathered>.1?'#FF5959':'#9FB3CD'}/></g>
      </g>;
    })}
  </>;
}

function JoiningPerson() {
  const frame=useCurrentFrame();const {fps}=useVideoConfig();
  const t=interpolate(frame,[5.1*fps,7*fps],[0,1],{...clamp,easing:ease});
  return <g transform={`translate(${252+190*t} 224)`} opacity={frame>=5.1*fps&&frame<7.1*fps?1:0}>
    <circle r={34-11*t} fill="#0E3268" stroke="#00A1DF" strokeWidth="2"/>
    <Person color="#00A1DF" size={1.05-.25*t}/>
  </g>;
}

function Channel({label,y,delay}:{label:string;y:number;delay:number}) {
  const frame=useCurrentFrame();const {fps}=useVideoConfig();
  const t=amount(frame,delay*fps,(delay+1.35)*fps);
  const again=amount(frame,(delay+2.25)*fps,(delay+3.6)*fps);
  const arrived=amount(frame,(delay+1.2)*fps,(delay+1.45)*fps);
  const x=(1-t)**3*520+3*(1-t)**2*t*574+3*(1-t)*t*t*567+t**3*606;
  const cy=(1-t)**3*224+3*(1-t)**2*t*224+3*(1-t)*t*t*y+t**3*y;
  const repeatX=(1-again)**3*520+3*(1-again)**2*again*574+3*(1-again)*again*again*567+again**3*606;
  const repeatY=(1-again)**3*224+3*(1-again)**2*again*224+3*(1-again)*again*again*y+again**3*y;
  return <>
    <path d={`M520 224C574 224 567 ${y} 606 ${y}`} fill="none" stroke="#3A5C8F" strokeWidth="1.7"/>
    <path d={`M520 224C574 224 567 ${y} 606 ${y}`} fill="none" stroke="#00AD68" strokeWidth="2.5" pathLength="1" strokeDasharray="1" strokeDashoffset={1-t} opacity={1-amount(frame,15.6*fps,16*fps-1)}/>
    <g transform={`translate(661 ${y}) scale(${1+Math.sin(arrived*Math.PI)*.07})`}>
      <rect x="-55" y="-43" width="110" height="86" rx="12" fill="#0A2450" stroke={arrived>.5?'#00AD68':'#3A5C8F'} strokeWidth="1.5"/>
      <g transform="translate(0 -10)"><Glyph kind={label} color={arrived>.5?'#00AD68':'#9FB3CD'}/></g>
      <text y="30" textAnchor="middle" fill="#EAF1FA" fontSize="25" fontWeight="500">{label}</text>
    </g>
    <circle cx={x} cy={cy} r="5" fill="#00AD68" opacity={t>0&&t<1?1:0}/>
    <circle cx={repeatX} cy={repeatY} r="4" fill="#00AD68" opacity={again>0&&again<1?1:0}/>
  </>;
}

export function Journey() {
  const frame=useCurrentFrame(); const {fps}=useVideoConfig();
  const release=amount(frame,15.6*fps,16*fps);
  return <AbsoluteFill style={{fontFamily:'"DM Sans",sans-serif'}}>
    <svg viewBox="0 0 720 440" width="720" height="440">
      <text x="252" y="53" fill="#EAF1FA" textAnchor="middle" fontSize="29" fontWeight="550">Identity</text>
      <text x="442" y="53" fill="#EAF1FA" textAnchor="middle" fontSize="29" fontWeight="550">Audience</text>
      <text x="650" y="53" fill="#EAF1FA" textAnchor="middle" fontSize="29" fontWeight="550">Campaign</text>
      <path d="M296 224H365" stroke="#3A5C8F" strokeWidth="2"/>
      <path d="m341 217 8 7-8 7" stroke="#9FB3CD" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <Interactive.G name="Store · purchase signals"><Source label="Store" y={117} color="#00A1DF" delay={0}/></Interactive.G>
      <Interactive.G name="CRM · customer records"><Source label="CRM" y={224} color="#FF5959" delay={15}/></Interactive.G>
      <Interactive.G name="Video · viewing signals"><Source label="Video" y={331} color="#F58D39" delay={30}/></Interactive.G>
      <g transform="translate(252 224)"><Interactive.G name="Identity · signals become one person" style={{scale:interpolate(frame,[0,5*fps,5*fps+7,15.6*fps,16*fps-1],[1.06,1.06,1,1,1.06],{...clamp,easing:ease})}}><g transform="translate(-252 -224)"><Customer/></g></Interactive.G></g>
      <g transform="translate(442 224)"><Interactive.G name="Audience · the same person joins the group" style={{scale:interpolate(frame,[0,5*fps,5*fps+7,10*fps,10*fps+7],[1,1,1.06,1.06,1],{...clamp,easing:ease})}}><g transform="translate(-442 -224)"><Audience/></g></Interactive.G></g>
      <Interactive.G name="Campaign · activate email"><Channel label="Email" y={117} delay={10}/></Interactive.G>
      <Interactive.G name="Campaign · activate ads"><Channel label="Ads" y={224} delay={10.5}/></Interactive.G>
      <Interactive.G name="Campaign · activate video"><Channel label="Video" y={331} delay={11}/></Interactive.G>
      <Interactive.G name="The identified person moves into the audience"><JoiningPerson/></Interactive.G>
      <text x="252" y="393" fill="#9FB3CD" textAnchor="middle" fontSize="24">One person</text>
      <text x="442" y="393" fill="#9FB3CD" textAnchor="middle" fontSize="24">Your audience</text>
      <text x="650" y="393" fill="#9FB3CD" textAnchor="middle" fontSize="24">Every channel</text>
      <path d="M199 418H294" stroke="#00A1DF" strokeWidth="2" opacity={frame<5*fps?1:.22+release*.78}/>
      <path d="M394 418H489" stroke="#FF5959" strokeWidth="2" opacity={frame>=5*fps&&frame<10*fps?1:.22}/>
      <path d="M602 418H697" stroke="#00AD68" strokeWidth="2" opacity={frame>=10*fps?1-release*.78:.22}/>
    </svg>
  </AbsoluteFill>;
}
