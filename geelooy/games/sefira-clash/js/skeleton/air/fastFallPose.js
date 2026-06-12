/**
 * B"H
 * Awtsmoos tiny pose vessel: visual-only readability, no gameplay authority.
 */
export function fastFallPose(p,f,m,style,body){if(!m.fastFallAmount&&f.attack?.id!=='meteorKick')return p;const s=body.height,face=m.facing,k=Math.max(m.fastFallAmount,f.attack?.id==='meteorKick'?1:.4);p.chest.x+=face*18*k*s;p.head.x+=face*14*k*s;p.leftHand.y+=42*k*s;p.rightHand.y+=42*k*s;p.leftFoot.x+=8*k*s;p.rightFoot.x-=8*k*s;p.leftFoot.y-=12*k*s;return p}
