/** B"H — hands remember danger before thought does. */
import { add } from '../../CharacterRig.js';
import { wave } from '../Math.js';
export function guardTwitch(p,f,guard=false){
 const face=p.face,t=wave(f,.17),near=guard||f.nearEnemy,heat=f.aiMind?.combatHeat?.heat||0;
 const lift=near?-24-Math.min(12,heat*.08):-2;
 p.leftHand=add(p.leftHand,-face*(near?14:5)+t*(near?2:1),lift+t*2);
 p.rightHand=add(p.rightHand,face*(near?16:6)-t*(near?2:1),lift-3-t*2);
 p.leftElbow=add(p.leftElbow,-face*(near?8:2),near?-12:0);
 p.rightElbow=add(p.rightElbow,face*(near?8:2),near?-14:0);
 return p;
}
