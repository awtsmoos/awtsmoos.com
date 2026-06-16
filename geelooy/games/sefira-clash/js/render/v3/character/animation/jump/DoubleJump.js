/** B"H — second ignition twists the whole body. */
import { add } from '../../CharacterRig.js';
import { clamp,wave } from '../Math.js';
export function doubleJump(p,f){
 const face=p.face,l=clamp(-(f.vy||0)/16),spin=wave(f,.42);
 p.pelvis=add(p.pelvis,face*spin*7,-l*5);
 p.chest=add(p.chest,face*(12+spin*4),-l*15);
 p.head=add(p.head,face*(9+spin*3),-l*12);
 p.leftHand=add(p.leftHand,-face*36,-32-l*23);
 p.rightHand=add(p.rightHand,face*42,-42-l*26);
 p.leftKnee=add(p.leftKnee,-face*22,-16+l*5);
 p.rightKnee=add(p.rightKnee,face*24,-18+l*4);
 p.leftFoot=add(p.leftFoot,-face*26,-7-l*5);
 p.rightFoot=add(p.rightFoot,face*30,-8-l*6);
 return p;
}
