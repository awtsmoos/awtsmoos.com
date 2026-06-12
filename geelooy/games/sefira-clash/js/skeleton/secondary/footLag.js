/**
 * B"H
 * Ruthless audit repair vessel: active hyper-real animation, visual-only.
 */
export function footLag(p,f,m,style,body){if(m.grounded)return p;const s=body.height,trail=-Math.sign(f.vx||0)*Math.min(8,Math.abs(f.vx||0)*.25)*s;p.leftFoot.x+=trail;p.rightFoot.x+=trail;return p}
