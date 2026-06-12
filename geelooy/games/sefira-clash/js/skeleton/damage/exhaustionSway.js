/**
 * B"H
 * Next hyper-real outer-life vessel: degradation, micro motion, impact, eyes. Visual-only.
 */
export function exhaustionSway(p,f,body,damage){const k=damage.wobble||0,s=body.height,w=Math.sin((f.motionClock||0)*.07);p.hip.x+=w*5*k*s;p.chest.x-=w*4*k*s;p.head.x-=w*6*k*s;return p}
