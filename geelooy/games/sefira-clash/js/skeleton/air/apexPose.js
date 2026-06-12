/**
 * B"H
 * Awtsmoos tiny pose vessel: visual-only readability, no gameplay authority.
 */
export function apexPose(p,f,m,style,body){if(!m.airborne||Math.abs(m.verticalSpeed)>1.6)return p;const s=body.height,face=m.facing;p.leftHand.x-=face*18*s;p.rightHand.x+=face*18*s;p.leftKnee.y+=8*s;p.rightKnee.y+=8*s;p.chest.y+=2*s;return p}
