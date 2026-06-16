/** B"H — weight moves in the feet so idle becomes a stance. */
import { add } from '../../CharacterRig.js';
import { wave } from '../Math.js';
export function weightShift(p,f,guard=false){
 const face=p.face,s=wave(f,.028),ready=guard||f.nearEnemy;
 p.pelvis=add(p.pelvis,face*s*(ready?4:2),ready?-1:0);
 p.leftKnee=add(p.leftKnee,-face*s*3,ready?-3:0);
 p.rightKnee=add(p.rightKnee,face*s*3,ready?-1:0);
 p.leftFoot=add(p.leftFoot,-face*s*(ready?4:1),0);
 p.rightFoot=add(p.rightFoot,face*s*(ready?4:1),0);
 return p;
}
