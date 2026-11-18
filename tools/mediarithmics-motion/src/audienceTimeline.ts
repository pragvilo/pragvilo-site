export function audienceMoment(frame:number, fps=30) {
  const index=Math.floor(frame/(12*fps))%3;
  const local=frame%(12*fps);
  return {index,local,step:local<2*fps?'request':local<4*fps?'rules':'created'} as const;
}
