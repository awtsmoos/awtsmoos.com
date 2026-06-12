/**
 * B"H
 * Next hyper-real inner-life vessel: breath, intent, recovery, personality, damage, micro, impact. Visual-only.
 */
export function panicIntent(p,f,m,body,state){const k=state.panic||0;if(k<=0)return p;const s=body.height;p.leftHand.y-=8*k*s;p.rightHand.y-=8*k*s;p.leftFoot.x-=6*k*s;p.rightFoot.x+=6*k*s;return p}
