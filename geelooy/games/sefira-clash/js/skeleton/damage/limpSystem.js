/**
 * B"H
 * Next hyper-real outer-life vessel: degradation, micro motion, impact, eyes. Visual-only.
 */
export function limpSystem(p,f,body,damage){const k=damage.stumble||0,s=body.height,side=Math.sin((f.motionClock||0)*.11)>0?1:-1;p.leftHand.y+=k*(side>0?8:3)*s;p.rightHand.y+=k*(side<0?8:3)*s;p.leftKnee.y+=k*(side>0?4:0)*s;p.rightKnee.y+=k*(side<0?4:0)*s;return p}
