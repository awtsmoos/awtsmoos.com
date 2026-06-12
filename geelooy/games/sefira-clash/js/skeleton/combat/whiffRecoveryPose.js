/**
 * B"H
 * Ruthless audit repair vessel: active hyper-real animation, visual-only.
 */
export function whiffRecoveryPose(p,f,m,body,intent,phase){if(!f.attack||phase.name!=='recovery')return p;const s=body.height,k=phase.recoil,face=m.facing;p.leftHand.x+=face*10*k*s;p.leftHand.y+=10*k*s;p.rightFoot.x-=face*6*k*s;return p}
