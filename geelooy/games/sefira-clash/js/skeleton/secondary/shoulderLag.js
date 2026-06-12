/**
 * B"H
 * Ruthless audit repair vessel: active hyper-real animation, visual-only.
 */
export function shoulderLag(p,f,m,style,body){const s=body.height,t=m.turnTimer||0;p.leftShoulder.x-=m.facing*t*4*s;p.rightShoulder.x-=m.facing*t*4*s;return p}
