/**
 * B"H
 * Next hyper-real inner-life vessel: breath, intent, recovery, personality, damage, micro, impact. Visual-only.
 */
export function retreatIntent(p,f,m,body,state){if(!state.retreat)return p;const s=body.height,face=m.facing;p.head.x-=face*10*s;p.chest.x-=face*6*s;p.leftHand.x-=face*10*s;return p}
