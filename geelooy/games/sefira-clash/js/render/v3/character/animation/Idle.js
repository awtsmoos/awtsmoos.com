/** B"H — idle is now breath, twitch, and weight. */
import { breath } from './idle/Breath.js';
import { guardTwitch } from './idle/GuardTwitch.js';
import { weightShift } from './idle/WeightShift.js';
export function idle(p,f,info={}){
 const guard=info.name==='combatIdle'||f.nearEnemy||f.aiMind?.combatHeat?.forceEngage;
 p=breath(p,f,guard);p=guardTwitch(p,f,guard);p=weightShift(p,f,guard);
 return p;
}
