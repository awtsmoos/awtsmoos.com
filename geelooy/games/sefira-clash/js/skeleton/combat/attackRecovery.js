/**
 * B"H
 * Ruthless audit repair vessel: active hyper-real animation, visual-only.
 */
export function attackRecovery(p,f,m,body,intent,phase){if(!f.attack||phase.recoil<=0)return p;const s=body.height,face=m.facing,k=phase.recoil;p.chest.x+=face*8*k*s;p.rightHand.x-=face*18*k*s;p.rightHand.y+=8*k*s;p.head.x-=face*3*k*s;return p}
