/**
 * B"H
 * Awtsmoos tiny pose vessel: visual-only readability, no gameplay authority.
 */
export function idlePose(p,f,m,style,body){if(!m.grounded||m.horizontalSpeed>1.2)return p;const s=body.height,b=Math.sin((f.motionClock||0)*.08)*(1.5+style.bounce);p.chest.y+=b;p.head.y+=b*.6;p.leftShoulder.y+=b*.35;p.rightShoulder.y+=b*.35;p.hip.x+=Math.sin((f.motionClock||0)*.045)*1.5*s;p.leftFoot.x-=2*s;p.rightFoot.x+=2*s;return p}
