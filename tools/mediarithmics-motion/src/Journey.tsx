import {AbsoluteFill, Easing, Interactive, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';

// The 16-beat narrative plays in 14 seconds, slightly quicker than the previous loop.
const ease = Easing.bezier(.2, 0, .2, 1);
const clamp = {extrapolateLeft:'clamp',extrapolateRight:'clamp'} as const;
const amount = (frame:number, start:number, end:number) => interpolate(frame,[start,end],[0,1],clamp);

function Person({color='#EAF1FA',size=1}:{color?:string;size?:number}) {
  return <g transform={`scale(${size})`} fill="none" stroke={color} strokeWidth="2.6" strokeLinecap="round"><circle cy="-8" r="8"/><path d="M-15 19v-3a15 15 0 0 1 30 0v3"/></g>;
}

// Familiar objects and quiet labels keep each source and channel recognisable.
function Glyph({kind,color}:{kind:string;color:string}) {
  return <g fill="none" stroke={color} strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
    {kind==='Store' ? <><path d="M-22-5h44l-5-14h-34zM-19 2v20h38V2M-8 22V7H3v15M8 7h7v8H8z"/><path d="M-22-5v4a6 6 0 0 0 11 0 6 6 0 0 0 11 0 6 6 0 0 0 11 0 6 6 0 0 0 11 0v-4M-11-19l-1 14M0-19v14m11-14 1 14"/></> : kind==='CRM' ? <><rect x="-24" y="-20" width="48" height="40" rx="5"/><circle cx="-10" cy="-6" r="5"/><path d="M-19 12v-3a9 9 0 0 1 18 0v3M5-8h11M5 0h11M5 8h7"/></> : kind==='Email' ? <><rect x="-23" y="-16" width="46" height="32" rx="4"/><path d="m-22-14 22 17 22-17"/></> : kind==='Ads' ? <><rect x="-23" y="-20" width="46" height="40" rx="4"/><path d="M-23-9h46M-15-15h1m5 0h1M-14 0H0m-14 7h8m12-9 15 10-9 2-3 9z"/></> : <><rect x="-24" y="-18" width="48" height="36" rx="5"/><path d="m-5-10 15 10-15 10z"/></>}
  </g>;
}

function Source({label,y,color,delay,profileScale,cardScale}:{label:string;y:number;color:string;delay:number;profileScale:number;cardScale:number}) {
  const frame=useCurrentFrame()*8/7;
  const {fps}=useVideoConfig();
  const local=frame-delay;
  const pulse=local>=0&&local<4.2*fps ? Math.sin(amount(local,0,4.2*fps)*Math.PI) : 0;
  const t=amount(local,.3*fps,3.8*fps);
  // Connections follow the changing sizes so the chain never breaks during zooms.
  const fromX=73+65*cardScale;
  const toX=252-44*profileScale;
  const x=(1-t)**3*fromX+3*(1-t)**2*t*(fromX+25)+3*(1-t)*t*t*(toX-22)+t**3*toX;
  const cy=(1-t)**3*y+3*(1-t)**2*t*y+3*(1-t)*t*t*224+t**3*224;
  return <>
    <path d={`M${fromX} ${y}C${fromX+25} ${y} ${toX-22} 224 ${toX} 224`} stroke={color} strokeWidth="1.8" opacity=".35" fill="none"/>
    <path d={`M${fromX} ${y}C${fromX+25} ${y} ${toX-22} 224 ${toX} 224`} stroke={color} strokeWidth="2.8" pathLength="1" strokeDasharray="1" strokeDashoffset={1-t} opacity={(.5+pulse*.5)*(1-amount(frame,15.6*fps,16*fps-1))} fill="none"/>
    <g transform={`translate(73 ${y-pulse*5}) scale(${cardScale})`}><g transform={`translate(-73 ${-y})`}>
      <title>{label}</title>
      <rect x="8" y={y-38} width="130" height="86" rx="12" fill="#061E44" stroke="#1C4378"/>
      <rect x="8" y={y-43} width="130" height="86" rx="12" fill="#0E3268" stroke="#3A5C8F" filter="url(#journey-lift)"/>
      <g transform={`translate(73 ${y-9})`}><Glyph kind={label} color={color}/></g>
      <text x="73" y={y+31} textAnchor="middle" fontSize="18" fontWeight="500" fill="#9FB3CD">{label}</text>
    </g></g>
    <circle cx={x} cy={cy} r="5" fill={color} opacity={local>.3*fps&&local<3.8*fps?1:0}/>
  </>;
}

function Customer() {
  const frame=useCurrentFrame()*8/7; const {fps}=useVideoConfig();
  const receive=amount(frame,.8*fps,4.4*fps);
  const release=1-amount(frame,15.6*fps,16*fps-1);
  return <>
    <circle cx="252" cy="230" r="44" fill="#061E44" stroke="#1C4378"/>
    <circle cx="252" cy="224" r={44+Math.sin(receive*Math.PI)*5} fill="#0E3268" stroke="#3A5C8F" strokeWidth="1.5" filter="url(#journey-lift)"/>
    <circle cx="252" cy="223" r="38" fill="none" stroke="#EAF1FA" strokeOpacity=".08"/>
    <g transform="translate(252 224) rotate(-90)" opacity={release}>
      <circle r="44" fill="none" stroke="#00A1DF" strokeWidth="3" pathLength="1" strokeDasharray={`${.29*amount(frame,2.5*fps,3.8*fps)} 1`}/>
      <circle r="44" fill="none" stroke="#FF5959" strokeWidth="3" pathLength="1" strokeDasharray={`${.29*amount(frame,3*fps,4.3*fps)} 1`} strokeDashoffset="-.333"/>
      <circle r="44" fill="none" stroke="#F58D39" strokeWidth="3" pathLength="1" strokeDasharray={`${.29*amount(frame,3.5*fps,4.8*fps)} 1`} strokeDashoffset="-.666"/>
    </g>
    <g transform="translate(252 221)"><Person size={1.35}/></g>
  </>;
}

function Audience() {
  const frame=useCurrentFrame()*8/7; const {fps}=useVideoConfig();
  const gathered=amount(frame,7.2*fps,8.4*fps);
  const release=1-amount(frame,15.6*fps,16*fps-1);
  return <>
    <rect x="346" y="142" width="192" height="174" rx="12" fill="#061E44" stroke="#1C4378"/>
    <rect x="346" y="137" width="192" height="174" rx="12" fill="#0A2450" stroke="#3A5C8F" filter="url(#journey-lift)"/>
    <rect x="351" y="142" width="182" height="164" rx="9" fill="none" stroke="#EAF1FA" strokeOpacity=".06"/>
    <path d="M392 202C410 194 446 194 460 202C470 214 470 281 459 293C444 302 405 302 392 292C383 279 383 217 392 202Z" fill="#FF5959" fillOpacity={.07*gathered*release} stroke="#FF5959" strokeWidth="2" pathLength="1" strokeDasharray="1" strokeDashoffset={1-gathered} opacity={release}/>
    {Array.from({length:15},(_,i)=>{
      const x=374+i%5*34; const y=173+Math.floor(i/5)*51;
      const selected=[6,7,11,12].includes(i);
      const settle=selected?Math.sin(gathered*Math.PI)*3:0;
      return <g key={i} transform={`translate(${x} ${y-settle})`}>
        {i===7&&<circle r="18" fill="#0E3268" stroke="#00A1DF" strokeWidth="1.7"/>}
        <g opacity={i===7?amount(frame,6.8*fps,7.1*fps)*release:1}><Person size={i===7?.67:.52} color={i===7?'#00A1DF':selected&&gathered>.1?'#FF5959':'#7E94B4'}/></g>
      </g>;
    })}
  </>;
}

function JoiningPerson() {
  const frame=useCurrentFrame()*8/7;const {fps}=useVideoConfig();
  const t=interpolate(frame,[5.1*fps,7*fps],[0,1],{...clamp,easing:ease});
  return <g transform={`translate(${252+190*t} 224)`} opacity={frame>=5.1*fps&&frame<7.1*fps?1:0}>
    <circle r={34-12*t} fill="#0E3268" stroke="#00A1DF" strokeWidth="2"/>
    <Person color="#00A1DF" size={1.05-.23*t}/>
  </g>;
}

function Channel({label,y,delay,cardScale,fromX}:{label:string;y:number;delay:number;cardScale:number;fromX:number}) {
  const frame=useCurrentFrame()*8/7;const {fps}=useVideoConfig();
  const t=amount(frame,delay*fps,(delay+1.35)*fps);
  const again=amount(frame,(delay+2.25)*fps,(delay+3.6)*fps);
  const arrived=amount(frame,(delay+1.2)*fps,(delay+1.45)*fps);
  const toX=650-50*cardScale;
  const x=(1-t)**3*fromX+3*(1-t)**2*t*(fromX+35)+3*(1-t)*t*t*(toX-25)+t**3*toX;
  const cy=(1-t)**3*224+3*(1-t)**2*t*224+3*(1-t)*t*t*y+t**3*y;
  const repeatX=(1-again)**3*fromX+3*(1-again)**2*again*(fromX+35)+3*(1-again)*again*again*(toX-25)+again**3*toX;
  const repeatY=(1-again)**3*224+3*(1-again)**2*again*224+3*(1-again)*again*again*y+again**3*y;
  return <>
    <path d={`M${fromX} 224C${fromX+35} 224 ${toX-25} ${y} ${toX} ${y}`} fill="none" stroke="#3A5C8F" strokeWidth="1.7"/>
    <path d={`M${fromX} 224C${fromX+35} 224 ${toX-25} ${y} ${toX} ${y}`} fill="none" stroke="#00AD68" strokeWidth="2.5" pathLength="1" strokeDasharray="1" strokeDashoffset={1-t} opacity={1-amount(frame,15.6*fps,16*fps-1)}/>
    <g transform={`translate(650 ${y}) scale(${cardScale*(1+Math.sin(arrived*Math.PI)*.04)})`}>
      <rect x="-50" y="-35" width="100" height="80" rx="12" fill="#061E44" stroke="#1C4378"/>
      <rect x="-50" y="-40" width="100" height="80" rx="12" fill="#0E3268" stroke={arrived>.5?'#00AD68':'#3A5C8F'} strokeWidth="1.5" filter="url(#journey-lift)"/>
      <rect x="-45" y="-35" width="90" height="70" rx="8" fill="none" stroke="#EAF1FA" strokeOpacity=".06"/>
      <g transform="translate(0 -9) scale(.85)"><Glyph kind={label} color={arrived>.5?'#00AD68':'#9FB3CD'}/></g>
      <text y="30" textAnchor="middle" fill="#9FB3CD" fontSize="18" fontWeight="500">{label}</text>
    </g>
    <circle cx={x} cy={cy} r="5" fill="#00AD68" opacity={t>0&&t<1?1:0}/>
    <circle cx={repeatX} cy={repeatY} r="4" fill="#00AD68" opacity={again>0&&again<1?1:0}/>
  </>;
}

export function Journey() {
  const frame=useCurrentFrame()*8/7; const {fps}=useVideoConfig();
  const identity=interpolate(frame,[0,5*fps,5*fps+7,15.6*fps,16*fps-1],[1,1,0,0,1],{...clamp,easing:ease});
  const audience=interpolate(frame,[0,5*fps,5*fps+7,10*fps,10*fps+7,16*fps-1],[0,0,1,1,0,0],{...clamp,easing:ease});
  const campaign=interpolate(frame,[0,10*fps,10*fps+7,14*fps,14*fps+7,16*fps-1],[0,0,1,1,0,0],{...clamp,easing:ease});
  // A brief full-colour overview closes the loop and provides the reduced-motion frame.
  const isolate=interpolate(frame,[0,14*fps,14*fps+7,15.6*fps,16*fps-1],[1,1,0,0,1],{...clamp,easing:ease});
  const profileZoom=interpolate(frame,[0,.3*fps,5*fps,5*fps+7,14*fps,14*fps+7,15.6*fps,16*fps-1],[1.25,1.55,1.55,.76,.76,1,1,1.25],{...clamp,easing:ease});
  const audienceZoom=interpolate(frame,[0,5*fps,5*fps+7,10*fps,10*fps+7,14*fps,14*fps+7,15.6*fps,16*fps-1],[.76,.76,1.22,1.22,.76,.76,1,1,.76],{...clamp,easing:ease});
  const campaignZoom=interpolate(frame,[0,10*fps,10*fps+7,14*fps,14*fps+7,15.6*fps,16*fps-1],[.76,.76,1.22,1.22,1,1,.76],{...clamp,easing:ease});
  return <AbsoluteFill style={{fontFamily:'"DM Sans",sans-serif'}}>
    <svg viewBox="0 0 720 440" width="720" height="440">
      <defs><filter id="journey-lift" x="-30%" y="-30%" width="160%" height="175%" colorInterpolationFilters="sRGB"><feDropShadow dx="0" dy="6" stdDeviation="4" floodColor="#061E44" floodOpacity=".65"/></filter></defs>
      <path d={`M${252+44*profileZoom} 224H${442-96*audienceZoom}`} stroke="#3A5C8F" strokeWidth="2"/>
      <Interactive.G name="Sources · store, CRM and video" style={{filter:`grayscale(${(1-identity)*isolate})`,opacity:1-.5*(1-identity)*isolate}}>
        <Source label="Store" y={117} color="#00A1DF" delay={0} profileScale={profileZoom} cardScale={.88+.12*identity}/>
        <Source label="CRM" y={224} color="#FF5959" delay={15} profileScale={profileZoom} cardScale={.88+.12*identity}/>
        <Source label="Video" y={331} color="#F58D39" delay={30} profileScale={profileZoom} cardScale={.88+.12*identity}/>
      </Interactive.G>
      <g transform="translate(252 224)"><Interactive.G name="Identity · signals converge, zoom in then out" style={{scale:profileZoom,filter:`grayscale(${(1-identity)*isolate})`,opacity:1-.5*(1-identity)*isolate}}><g transform="translate(-252 -224)"><Customer/></g></Interactive.G></g>
      <g transform="translate(442 224)"><Interactive.G name="Audience · person joins, zoom in then out" style={{scale:audienceZoom,filter:`grayscale(${(1-audience)*isolate})`,opacity:1-.5*(1-audience)*isolate}}><g transform="translate(-442 -224)"><Audience/></g></Interactive.G></g>
      <Interactive.G name="Campaign · channels activate, zoom in then out" style={{filter:`grayscale(${(1-campaign)*isolate})`,opacity:1-.5*(1-campaign)*isolate}}>
        <Channel label="Email" y={117} delay={10} cardScale={campaignZoom} fromX={442+96*audienceZoom}/>
        <Channel label="Ads" y={224} delay={10.5} cardScale={campaignZoom} fromX={442+96*audienceZoom}/>
        <Channel label="Video" y={331} delay={11} cardScale={campaignZoom} fromX={442+96*audienceZoom}/>
      </Interactive.G>
      <Interactive.G name="The identified person moves into the audience"><JoiningPerson/></Interactive.G>
      <text x="252" y="413" fill="#00A1DF" textAnchor="middle" fontSize="26" fontWeight="550" opacity={1-.3*(1-identity)*isolate}>Identity</text>
      <text x="442" y="413" fill="#FF5959" textAnchor="middle" fontSize="26" fontWeight="550" opacity={1-.3*(1-audience)*isolate}>Audience</text>
      <text x="650" y="413" fill="#00AD68" textAnchor="middle" fontSize="26" fontWeight="550" opacity={1-.3*(1-campaign)*isolate}>Campaign</text>
    </svg>
  </AbsoluteFill>;
}
