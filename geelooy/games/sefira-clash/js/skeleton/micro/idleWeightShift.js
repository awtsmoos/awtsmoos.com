/**
 * B"H
 * Next hyper-real outer-life vessel: degradation, micro motion, impact, eyes. Visual-only.
 */
export function idleWeightShift(p,f,m,body){if(!m.grounded||m.horizontalSpeed>1.1)return p;const s=body.height,w=Math.sin((f.motionClock||0)*.035);p.hip.x+=w*3*s;p.leftFoot.x-=Math.max(0,w)*2*s;p.rightFoot.x+=Math.max(0,-w)*2*s;return p}
