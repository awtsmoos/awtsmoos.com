/**
 * B"H
 * Awtsmoos tiny pose vessel: visual-only readability, no gameplay authority.
 */
export function turnPose(p,f,m,style,body){const t=Math.max(m.turnMismatch,m.turnTimer||0);if(!t)return p;const s=body.height,face=m.facing;p.chest.x-=face*15*t*s;p.head.x+=face*16*t*s;p.leftHand.x-=face*18*t*s;p.rightHand.x-=face*10*t*s;p.leftFoot.x-=10*t*s;p.rightFoot.x+=10*t*s;return p}
