/** B"H — down-special dive becomes a spear. */
import { add } from '../../CharacterRig.js';
export function divePose(p,f){
 const face=p.face;
 p.chest=add(p.chest,face*8,10);p.head=add(p.head,face*9,12);
 p.leftHand=add(p.leftHand,-face*8,28);p.rightHand=add(p.rightHand,face*8,28);
 p.leftKnee=add(p.leftKnee,-face*6,18);p.rightKnee=add(p.rightKnee,face*6,18);
 p.leftFoot=add(p.leftFoot,-face*4,28);p.rightFoot=add(p.rightFoot,face*4,28);
 return p;
}
