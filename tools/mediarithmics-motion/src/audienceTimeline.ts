export const audienceSeconds = 6;
export const audienceSelections = [[0,3,8,10],[1,2,4,5,7,9,11],[0,6,9]];
export const audienceColors = ['#FF5959','#00AD68','#F58D39'];

export function audienceMoment(frame:number, fps=30) {
  const index=Math.floor(frame/(audienceSeconds*fps))%3;
  const local=frame%(audienceSeconds*fps);
  return {index,local,step:local<.6*fps?'request':local<1.2*fps?'rules':'created'} as const;
}
