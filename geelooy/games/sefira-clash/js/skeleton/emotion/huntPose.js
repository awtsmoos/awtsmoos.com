/**
 * B"H
 * Awtsmoos split vessel: small readable module, visual-only.
 */
export function huntPose(p,f,intent,body){const s=body.height,k=intent.hunt||0,face=f.face||1;p.chest.x+=face*10*k*s;p.head.x+=face*12*k*s;p.leftHand.x+=face*6*k*s;p.rightHand.x+=face*6*k*s;p.leftFoot.x-=face*4*k*s;p.rightFoot.x+=face*4*k*s;return p}
