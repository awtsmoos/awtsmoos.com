/**
 * B"H
 * Awtsmoos split vessel: small readable module, visual-only.
 */
export function recoverPose(p,f,intent,body){const s=body.height,k=intent.recover||0;p.leftHand.y-=16*k*s;p.rightHand.y-=14*k*s;p.leftFoot.y+=12*k*s;p.rightFoot.y+=10*k*s;return p}
