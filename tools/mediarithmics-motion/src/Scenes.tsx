import {AbsoluteFill, Img, Interactive, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Identity} from './Composition';

export const IdentityLoop = () => <AbsoluteFill style={{fontFamily: '"DM Sans", sans-serif'}}><Identity/></AbsoluteFill>;

export function AudienceFlow() {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const phase = Math.min(2, Math.floor(frame / (5 * fps)));
  const selection = interpolate(frame, [5 * fps, 5 * fps + 6], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return <AbsoluteFill style={{fontFamily: '"DM Sans", sans-serif'}}>
    <svg viewBox="0 0 600 110" width="600" height="110">
      {Array.from({length: 8}, (_, i) => {
        const selected = [0, 2, 3, 5, 7].includes(i);
        const color = phase === 2 ? '#00AD68' : '#7057D1';
        const x = 38 + i * 75;
        const y = 55;
        const arrive = interpolate(frame, [i, i + 6], [8, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
        return <g key={i} transform={`translate(${x} ${y + arrive})`} opacity={selected ? 1 : 1 - selection * .8}>
          <circle r="34" fill={selected && phase > 0 ? color : '#EDF2F8'} stroke={selected && phase > 0 ? color : '#D2DCE8'} strokeWidth="1.5"/>
          <g stroke={selected && phase > 0 ? '#FFFFFF' : '#4D5F80'} strokeWidth="2.6" fill="none" strokeLinecap="round"><circle cy="-9" r="9"/><path d="M-17 20v-3a17 17 0 0 1 34 0v3"/></g>
        </g>;
      })}
    </svg>
  </AbsoluteFill>;
}

export function RetailFlow() {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const phase = Math.min(2, Math.floor(frame / (4 * fps)));
  const colors = ['#00A1DF', '#FF5959', '#00AD68'];
  return <AbsoluteFill style={{fontFamily:'"DM Sans", sans-serif'}}>
    <svg viewBox="0 0 720 440" width="720" height="440">
      <path d="M132 202H588" fill="none" stroke="#3A5C8F" strokeWidth="2"/>
      <path d="M132 202H588" fill="none" stroke={colors[phase]} strokeWidth="3" pathLength="1" strokeDasharray="1" strokeDashoffset={1 - interpolate(frame,[0,8 * fps],[0,1],{extrapolateRight:'clamp'})}/>
      {[0,1,2].map(i => <g key={i} transform={`translate(${35 + i * 240} 111)`}>
        <rect width="170" height="181" rx="12" fill="#061E44" stroke={phase >= i ? colors[i] : '#3A5C8F'} strokeWidth="2"/>
        <g transform="translate(85 69)" stroke={phase >= i ? colors[i] : '#9FB3CD'} fill="none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          {i === 0 ? <><rect x="-35" y="-29" width="70" height="52" rx="5"/><path d="M-35-15h70m-28 9 23 15-13 2-5 13z"/></> : i === 1 ? <><path d="M-25-34l8 5 8-5 9 5 8-5 9 5 8-5v70l-8-5-8 5-9-5-8 5-9-5-8 5z"/><path d="M-13-12h26M-13 0h26m-26 12h16"/></> : <><circle r="33"/><path d="m-16 0 11 11L17-13" strokeDasharray="60" strokeDashoffset={60 * (1 - interpolate(frame,[8 * fps,8 * fps + 6],[0,1],{extrapolateLeft:'clamp',extrapolateRight:'clamp'}))}/></>}
        </g>
        <text x="85" y="144" fill="#EAF1FA" textAnchor="middle" fontSize="26">{['Ad click','Store receipt','Match'][i]}</text>
      </g>)}
    </svg>
    <Interactive.Div name="Retail journey caption" style={{position:'absolute',top:341,left:20,right:20,textAlign:'center',fontSize:31,color:'#EAF1FA',letterSpacing:'-.035em'}}>{['A shopper clicks your ad.','They use their loyalty card in store.','One account connects the journey.'][phase]}</Interactive.Div>
  </AbsoluteFill>;
}

export function AmbientArtwork({source = 'retail.svg'}: {source?: string}) {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  return <AbsoluteFill style={{overflow:'hidden'}}>
    <Interactive.Div name="Brand artwork" style={{position:'absolute',inset:0,scale:1.05,translate:`0 ${Math.sin(frame / durationInFrames * Math.PI * 2) * 7}px`,rotate:`${Math.sin(frame / durationInFrames * Math.PI * 2) * .7}deg`}}>
      <Img src={source.startsWith('/') ? source : staticFile(source)} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
    </Interactive.Div>
  </AbsoluteFill>;
}
