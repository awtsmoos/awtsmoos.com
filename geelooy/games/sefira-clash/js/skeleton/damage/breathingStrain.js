/**
 * B"H
 * Next hyper-real outer-life vessel: degradation, micro motion, impact, eyes. Visual-only.
 */
export function breathingStrain(p,f,body,damage){const k=damage.breathStrain||0,s=body.height,w=Math.sin((f.motionClock||0)*.17);p.chest.y+=Math.abs(w)*4*k*s;p.leftShoulder.x-=w*2*k*s;p.rightShoulder.x+=w*2*k*s;return p}
