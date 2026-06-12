/**
 * B"H
 * Awtsmoos split vessel: small readable module, visual-only.
 */
export function panicPose(p,f,intent,body){const s=body.height,k=intent.panic||0,face=f.face||1;p.head.x-=face*9*k*s;p.chest.x-=face*5*k*s;p.leftHand.x-=face*16*k*s;p.rightHand.x+=face*12*k*s;p.leftHand.y-=8*k*s;p.rightHand.y-=6*k*s;p.leftFoot.x-=8*k*s;p.rightFoot.x+=8*k*s;return p}
