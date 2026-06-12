/**
 * B"H
 * Awtsmoos tiny pose vessel: visual-only readability, no gameplay authority.
 */
export function fallPose(p,f,m,style,body,intent){if(!m.airborne||m.verticalSpeed<=1||m.fastFallAmount)return p;const s=body.height,face=m.facing;p.chest.x+=face*(6+(intent.recover||0)*14)*s;p.leftHand.y+=22*s;p.rightHand.y+=18*s;p.leftFoot.y+=8*s;p.rightFoot.y+=8*s;return p}
