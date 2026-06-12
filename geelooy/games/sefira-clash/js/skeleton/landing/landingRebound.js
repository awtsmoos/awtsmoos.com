/**
 * B"H
 * Ruthless audit repair vessel: active hyper-real animation, visual-only.
 */
export function landingRebound(p,f,m,body){const lag=f.landingLag||0;if(!lag||m.landingImpact>.45)return p;const s=body.height,k=Math.min(1,lag/8);p.chest.y-=6*k*s;p.head.y-=4*k*s;p.leftHand.y-=3*k*s;p.rightHand.y-=3*k*s;return p}
