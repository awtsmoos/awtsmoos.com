/**
 * B"H
 * Awtsmoos tiny pose vessel: visual-only readability, no gameplay authority.
 */
import {point} from './shared.js';
export function grabPose(p,f,m,body,intent,phase){const s=body.height,face=m.facing;p.chest.x+=face*10*s;p.head.x+=face*6*s;p.rightElbow=point(p.rightShoulder.x+face*(42+18*phase.extension)*s,p.rightShoulder.y+26*s);p.rightHand=point(p.rightShoulder.x+face*(70+24*phase.extension)*s,p.rightShoulder.y+34*s);return p}
