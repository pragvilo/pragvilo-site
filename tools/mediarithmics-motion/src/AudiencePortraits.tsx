import {Easing, Interactive, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {audienceMoment, audienceSelections, audienceColors, audienceSeconds} from './audienceTimeline';

const clamp={extrapolateLeft:'clamp',extrapolateRight:'clamp',easing:Easing.bezier(.2,0,.2,1)} as const;
const surroundingPositions=[[48,55],[552,55],[48,140],[552,140],[48,225],[552,225],[48,310],[552,310],[300,325]];
function selectedPosition(rank:number,count:number) {
  const columns=count>4?3:2;
  const rows=Math.ceil(count/columns);
  const row=Math.floor(rank/columns);
  const inRow=Math.min(columns,count-row*columns);
  return [300+(rank%columns-(inRow-1)/2)*108,180+(row-(rows-1)/2)*96];
}

function Portrait({variant}:{variant:number}) {
  const hair=variant%4;
  const shirt=['#0077A8','#061E44','#F58D39','#FF5959'][variant%4];
  return <g stroke="#061E44" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle r="38" fill="#EDF2F8" stroke="none"/>
    {hair===2&&<path d="M-20 7C-30-27 29-30 21 11L26 27H-25Z" fill="#061E44"/>}
    <path d="M-33 37C-32 14-15 12 0 12S32 14 33 37" fill={shirt} stroke="none"/>
    <path d="M-7 6V17Q0 23 7 17V6" fill="#EDF2F8"/>
    <ellipse cy="-7" rx="17" ry="22" fill={variant%2?'#FFFFFF':'#F7F9FC'}/>
    {hair===0?<path d="M-17-10C-21-32 21-35 18-9L10-22Q-3-13-17-10Z" fill="#061E44"/>:hair===1?<><path d="M-17-11C-21-34 18-34 17-9L9-20Q-4-15-17-11Z" fill="#061E44"/><circle cx="12" cy="-29" r="8" fill="#061E44"/></>:hair===2?<path d="M-17-11Q-17-33 0-30Q20-29 17-7L6-24Q-3-16-17-11Z" fill="#061E44"/>:<path d="M-17-13Q-22-30-8-29Q1-38 9-29Q24-29 17-10L9-20-1-16-9-21Z" fill="#061E44"/>}
    {variant%3===0?<><rect x="-14" y="-10" width="11" height="8" rx="3" fill="none"/><rect x="3" y="-10" width="11" height="8" rx="3" fill="none"/><path d="M-3-7H3"/></>:<><path d="M-8-7h1M7-7h1" strokeWidth="2.4"/></>}
    <path d="M-4 3Q0 7 5 3" fill="none"/>
    {variant%5===0&&<path d="M-13 3Q0 24 13 3Q10 14 0 15Q-10 14-13 3Z" fill="#061E44" stroke="none"/>}
  </g>;
}

export function AudienceIllustration({frame=90,fps=30}:{frame?:number;fps?:number}) {
  const {index,local}=audienceMoment(frame,fps);
  const selection=interpolate(local,[2*fps,2*fps+7],[0,1],clamp);
  const reveal=interpolate(local,[2*fps,2*fps+6],[0,1],clamp);
  const reset=interpolate(local,[(audienceSeconds-.25)*fps,audienceSeconds*fps-1],[1,0],clamp);
  const color=audienceColors[index];
  const t=selection*reset;
  return <svg viewBox="0 0 600 360" width="600" height="360">
      <rect x="132" y="24" width="336" height="304" rx="36" fill="#EDF2F8" stroke={color} opacity={t}/>
      <g>
        {Array.from({length:12},(_,i)=>{
          const rank=audienceSelections[index].indexOf(i);
          const selected=rank!==-1;
          const other=Array.from({length:12},(_,j)=>j).filter(j=>!audienceSelections[index].includes(j)).indexOf(i);
          const target=selected?selectedPosition(rank,audienceSelections[index].length):surroundingPositions[other];
          const startX=90+(i%4)*140; const startY=65+Math.floor(i/4)*95;
          const x=startX+(target[0]-startX)*t;
          const y=startY+(target[1]-startY)*t;
          const scale=selected?.82+.28*t:.82-.28*t;
          return <g key={i} transform={`translate(${x} ${y}) scale(${scale})`} opacity={selected?1:1-.72*t}>
            <Portrait variant={i}/>
            <circle r="40" fill="none" stroke={color} strokeWidth="2.2" opacity={selected?reveal*reset:0}/>
            {selected&&<g opacity={t}><circle cx="29" cy="28" r="10" fill={color} stroke="#FFFFFF" strokeWidth="2"/><path d="m25 28 3 3 5-6" fill="none" stroke="#061E44" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></g>}
          </g>;
        })}
      </g>
    </svg>;
}

export function AudienceFlow() {
  return <Interactive.Div name="People matching the suggested criteria" style={{position:'absolute',inset:0}}><AudienceIllustration frame={useCurrentFrame()} fps={useVideoConfig().fps}/></Interactive.Div>;
}
