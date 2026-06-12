/**
 * B"H
 * Awtsmoos tiny pose vessel: visual-only readability, no gameplay authority.
 */
import {aimFor,point,perpOf,twistTorso} from './shared.js';
export function punchPose(p,f,m,body,intent,phase){const id=f.attack?.id||'',aim=aimFor(f,m),s=body.height,reach=(id==='dashPunch'||id==='chargePunch')?142:id==='uppercut'?132:112,draw=(30+intent.charge*18)*phase.anticipation*s,perp=perpOf(aim),sh=p.rightShoulder;twistTorso(p,aim,s,12*phase.extension+10*phase.anticipation,id==='uppercut'?-14*phase.extension:0);p.rightElbow=point(sh.x+aim.x*(40+reach*.28*phase.extension)*s+perp.x*draw,sh.y+aim.y*(40+reach*.28*phase.extension)*s+perp.y*draw);p.rightHand=point(sh.x+aim.x*(60+reach*phase.extension)*s-perp.x*10*phase.anticipation,sh.y+aim.y*(60+reach*phase.extension)*s-perp.y*10*phase.anticipation);p.leftHand=point(p.leftShoulder.x-aim.x*42*s,p.leftShoulder.y-aim.y*18*s+54*s);return p}
