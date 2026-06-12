/**
 * B"H
 * Next hyper-real outer-life vessel: degradation, micro motion, impact, eyes. Visual-only.
 */
export function balanceCorrection(p,f,m,body){const b=f.visualMass?.balance;if(!b)return p;const s=body.height;p.leftHand.x-=b.normalized*3*s;p.rightHand.x-=b.normalized*3*s;return p}
