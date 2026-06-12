/**
 * B"H
 * Ruthless audit repair vessel: active hyper-real animation, visual-only.
 */
export function hipLag(p,f,m,style,body){const s=body.height;p.hip.x-=Math.sign(f.vx||0)*Math.min(4,Math.abs(f.vx||0)*.18)*s;return p}
