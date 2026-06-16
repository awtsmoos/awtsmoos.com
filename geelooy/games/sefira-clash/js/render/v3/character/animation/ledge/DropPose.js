/** B"H — ledge drop releases into a small fall curl. */
import { add } from '../../CharacterRig.js';
export function dropPose(p,f){const side=f.ledgeHang?.side||-p.face||-1;p.chest=add(p.chest,side*8,12);p.head=add(p.head,side*10,10);p.leftHand=add(p.leftHand,side*16,20);p.rightHand=add(p.rightHand,side*16,20);return p;}
