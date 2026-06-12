/**
 * B"H
 * Awtsmoos tiny pose vessel: visual-only readability, no gameplay authority.
 */
export function runPose(p,f,m,style,body){if(!m.grounded||m.horizontalSpeed<=1.2)return p;const s=body.height,ph=m.footPhase*Math.PI*2,str=Math.min(1,m.horizontalSpeed/9)*(1+style.aggression*.16),dir=m.movingDirection,a=Math.sin(ph),b=Math.cos(ph);p.chest.x+=dir*(8+str*12)*s;p.head.x+=dir*3*s;p.leftHand.x+=-dir*a*30*s;p.rightHand.x+=dir*a*30*s;p.leftHand.y+=Math.abs(b)*12*s;p.rightHand.y+=Math.abs(b)*12*s;p.leftKnee.x+=dir*a*22*s;p.leftFoot.x+=dir*a*38*s;p.rightKnee.x-=dir*a*22*s;p.rightFoot.x-=dir*a*38*s;return p}
