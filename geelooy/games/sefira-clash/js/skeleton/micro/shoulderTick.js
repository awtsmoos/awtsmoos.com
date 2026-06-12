/**
 * B"H
 * Next hyper-real outer-life vessel: degradation, micro motion, impact, eyes. Visual-only.
 */
export function shoulderTick(p,f,m,body){const s=body.height,t=Math.sin((f.motionClock||0)*.23)*(f.attack?.id?1:.25);p.leftShoulder.y+=t*s;p.rightShoulder.y-=t*.6*s;return p}
