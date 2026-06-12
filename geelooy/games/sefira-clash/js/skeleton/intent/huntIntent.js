/**
 * B"H
 * Next hyper-real inner-life vessel: breath, intent, recovery, personality, damage, micro, impact. Visual-only.
 */
export function huntIntent(p,f,m,body,state){const k=state.hunt||0;if(k<=0)return p;const s=body.height,face=m.facing;p.head.x+=face*10*k*s;p.chest.x+=face*8*k*s;p.rightHand.x+=face*7*k*s;return p}
