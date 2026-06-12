/**
 * B"H
 * Next hyper-real inner-life vessel: breath, intent, recovery, personality, damage, micro, impact. Visual-only.
 */
export function attackIntent(p,f,m,body,state){if(!state.attack)return p;const s=body.height,face=m.facing,k=1-state.commit;p.head.x+=face*8*k*s;p.chest.x+=face*5*k*s;p.rightShoulder.x+=face*6*k*s;return p}
