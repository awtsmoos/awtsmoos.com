/** B"H — breath: the quiet proof the mannequin has died. */
import { add } from '../../CharacterRig.js';
import { wave } from '../Math.js';
export function breath(p,f,guard=false){
 const b=wave(f,.045),face=p.face;
 p.chest=add(p.chest,face*(guard?3:1),b*-2);
 p.pelvis=add(p.pelvis,-face*(guard?2:0),b);
 p.head=add(p.head,face*(guard?4:1),b*-2);
 return p;
}
