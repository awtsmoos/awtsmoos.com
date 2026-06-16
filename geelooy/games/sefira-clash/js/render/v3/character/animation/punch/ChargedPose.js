/** B"H — charged punch crouches, coils, explodes, and overshoots. */
import { add } from '../../CharacterRig.js';
export function chargedPose(p,face,side,other,sign,wind,hit,rec,reach,heavy){
 p.pelvis=add(p.pelvis,-face*wind*(16+heavy*10)+face*hit*8,wind*8-rec*2);
 p.chest=add(p.chest,-face*wind*(30+heavy*14)+face*hit*(28+heavy*20)-face*rec*14,-wind*13-hit*7+rec*8);
 p.head=add(p.head,-face*wind*14+face*hit*12,-wind*6-hit*3+rec*2);
 p[side+'Elbow']=add(p[side+'Shoulder'],sign*(-wind*38+hit*reach*.56+rec*45),34-wind*34-hit*22+rec*26);
 p[side+'Hand']=add(p[side+'Shoulder'],sign*(-wind*56+hit*reach+rec*62),30-wind*42-hit*28+rec*28);
 p[other+'Hand']=add(p[other+'Shoulder'],-sign*(38+wind*28),58-wind*18);
 p.leftKnee=add(p.leftKnee,-face*wind*8,-wind*10);p.rightKnee=add(p.rightKnee,face*hit*10,-hit*6);
 p.leftFoot=add(p.leftFoot,-face*wind*8,0);p.rightFoot=add(p.rightFoot,face*hit*12,0);
 return p;
}
