/**
 * B"H
 * Next hyper-real inner-life vessel: breath, intent, recovery, personality, damage, micro, impact. Visual-only.
 */
export function attackRecoveryPose(p,f,m,body){const k=f.visualStyle?.recoil?.attackRecoil||0;if(k<=0)return p;const s=body.height,face=m.facing;p.rightHand.x-=face*12*k*s;p.chest.x+=face*5*k*s;return p}
