/**
 * B"H
 * Awtsmoos tiny pose vessel: visual-only readability, no gameplay authority.
 */
export function risePose(p,f,m,style,body){if(!m.airborne||m.verticalSpeed>=-1)return p;const s=body.height,face=m.facing;p.chest.y-=8*s;p.leftHand.y-=30*s;p.rightHand.y-=32*s;p.leftFoot.x-=face*12*s;p.rightFoot.x-=face*5*s;p.leftFoot.y+=8*s;p.rightFoot.y+=10*s;return p}
