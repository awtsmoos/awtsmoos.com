/**
 * B"H
 * Next hyper-real inner-life vessel: breath, intent, recovery, personality, damage, micro, impact. Visual-only.
 */
export function balanceRecovery(p,f,m,body){const b=f.visualMass?.balance;if(!b||Math.abs(b.normalized)<.3)return p;const s=body.height;p.leftHand.x-=b.normalized*9*s;p.rightHand.x-=b.normalized*9*s;p.hip.x-=b.normalized*4*s;return p}
