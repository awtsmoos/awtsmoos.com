/** B"H — apex hang, the half-second where gravity waits. */
import { add } from '../../CharacterRig.js';
import { wave } from '../Math.js';
export function apexHang(p,f){
 const face=p.face,float=wave(f,.09);
 p.chest=add(p.chest,face*1,-5);
 p.head=add(p.head,face*float*3,-8);
 p.leftHand=add(p.leftHand,-face*25,-20+float*4);
 p.rightHand=add(p.rightHand,face*25,-20-float*4);
 p.leftKnee=add(p.leftKnee,-face*18,-9);
 p.rightKnee=add(p.rightKnee,face*18,-9);
 p.leftFoot=add(p.leftFoot,-face*16,-2);
 p.rightFoot=add(p.rightFoot,face*16,-2);
 return p;
}
