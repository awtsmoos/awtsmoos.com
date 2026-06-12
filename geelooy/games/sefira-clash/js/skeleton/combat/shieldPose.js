/**
 * B"H
 * Awtsmoos tiny pose vessel: visual-only readability, no gameplay authority.
 */
import {point} from './shared.js';
export function shieldPose(p,f,m,body){const s=body.height,face=m.facing;p.chest.x-=face*4*s;p.leftElbow=point(p.chest.x+face*18*s,p.chest.y+26*s);p.leftHand=point(p.chest.x+face*45*s,p.chest.y+42*s);p.rightElbow=point(p.chest.x+face*18*s,p.chest.y+52*s);p.rightHand=point(p.chest.x+face*48*s,p.chest.y+62*s);p.leftFoot.x-=8*s;p.rightFoot.x+=8*s;return p}
