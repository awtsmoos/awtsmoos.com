/** B"H — jab: tiny shoulder snap, fast readable retract. */
import { add } from '../../CharacterRig.js';
export function jabPose(p,face,side,other,sign,wind,hit,rec,reach){
 p.pelvis=add(p.pelvis,-face*wind*10+face*hit*5,wind*3);
 p.chest=add(p.chest,-face*wind*17+face*hit*20-face*rec*7,-wind*6-hit*4+rec*5);
 p.head=add(p.head,-face*wind*7+face*hit*8,-wind*3-hit*2);
 p[side+'Elbow']=add(p[side+'Shoulder'],sign*(-wind*24+hit*reach*.55+rec*28),30-wind*22-hit*16+rec*20);
 p[side+'Hand']=add(p[side+'Shoulder'],sign*(-wind*36+hit*reach+rec*42),26-wind*28-hit*21+rec*22);
 p[other+'Elbow']=add(p[other+'Shoulder'],-sign*(14+wind*18),43-wind*13);
 p[other+'Hand']=add(p[other+'Shoulder'],-sign*(24+wind*21),61-wind*14);
 return p;
}
