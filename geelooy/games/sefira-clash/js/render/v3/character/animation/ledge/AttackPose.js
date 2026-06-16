/** B"H — ledge attack: one hand still owns the lip, one fist snaps out. */
import { add } from '../../CharacterRig.js';
export function attackPose(p,f){const side=f.ledgeHang?.side||-p.face||-1;p.chest=add(p.chest,-side*14,-8);p.head=add(p.head,-side*12,-7);p.rightHand=add(p.rightHand,-side*50,-20);p.rightElbow=add(p.rightElbow,-side*28,-12);return p;}
