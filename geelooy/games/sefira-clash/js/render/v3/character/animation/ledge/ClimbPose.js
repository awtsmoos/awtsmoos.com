/** B"H — ledge climb anticipation, chest over stone. */
import { add } from '../../CharacterRig.js';
export function climbPose(p,f){
 p=arguments[0];const side=f.ledgeHang?.side||-p.face||-1;
 p.chest=add(p.chest,-side*18,-18);p.head=add(p.head,-side*20,-20);
 p.leftHand=add(p.leftHand,-side*10,-12);p.rightHand=add(p.rightHand,-side*10,-12);
 p.leftKnee=add(p.leftKnee,-side*12,-22);p.rightKnee=add(p.rightKnee,-side*8,-18);
 return p;
}
