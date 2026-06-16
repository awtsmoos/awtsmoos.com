/** B"H — ledge gateway: hang, climb, drop, attack. */
import { hangPose } from './ledge/HangPose.js';
import { climbPose } from './ledge/ClimbPose.js';
import { dropPose } from './ledge/DropPose.js';
import { attackPose } from './ledge/AttackPose.js';
export function ledge(p,f,info={}){
 p=hangPose(p,f);
 const input=f.input||f.lastInput||{};
 if(input.jump) return climbPose(p,f);
 if(input.down||input.y>.42||input.aimY>.42) return dropPose(p,f);
 if(input.punch||input.kick) return attackPose(p,f);
 return p;
}
