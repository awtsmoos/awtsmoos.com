/**
 * B"H
 * Awtsmoos tiny pose vessel: visual-only readability, no gameplay authority.
 */
import {aimFor,point,perpOf,twistTorso} from './shared.js';
export function kickPose(p,f,m,body,intent,phase){const id=f.attack?.id||'',aim=aimFor(f,m),s=body.height,reach=id==='roundhouse'?142:id==='aerialKick'?150:id==='meteorKick'?146:116,hip=p.rightHip,perp=perpOf(aim),fold=(38+intent.panic*12)*phase.anticipation*s;twistTorso(p,aim,s,18*phase.extension,-12*Math.abs(aim.y)*phase.extension);p.rightKnee=point(hip.x+aim.x*(38+reach*.32*phase.extension)*s+perp.x*fold,hip.y+aim.y*(38+reach*.32*phase.extension)*s+perp.y*fold);p.rightFoot=point(hip.x+aim.x*(58+reach*phase.extension)*s,hip.y+aim.y*(58+reach*phase.extension)*s);p.leftFoot=point(p.leftHip.x-aim.x*36*s,p.leftHip.y-aim.y*18*s+82*s);p.leftHand.x-=aim.x*24*phase.extension*s;p.rightHand.x-=aim.x*18*phase.extension*s;return p}
