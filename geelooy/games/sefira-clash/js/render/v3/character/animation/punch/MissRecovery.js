/** B"H — recovery: the body admits it overreached. */
import { add } from '../../CharacterRig.js';
export function missRecovery(p,f,rec){
 const face=p.face;
 p.chest=add(p.chest,face*rec*8,rec*5);
 p.head=add(p.head,face*rec*5,rec*2);
 p.leftHand=add(p.leftHand,-face*rec*7,rec*8);
 p.rightHand=add(p.rightHand,face*rec*7,rec*8);
 return p;
}
