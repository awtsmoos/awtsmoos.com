/**
 * B"H
 * Ruthless audit repair vessel: active hyper-real animation, visual-only.
 */
export function kneeLag(p,f,m,style,body){const s=body.height,trail=-Math.sign(f.vx||0)*Math.min(5,Math.abs(f.vx||0)*.2)*s;p.leftKnee.x+=trail*.6;p.rightKnee.x+=trail*.6;return p}
