import { driveBots } from '../ai/botBrain.js';
import { applyMovement } from '../physics/movement.js';
import { integrate } from '../physics/integrate.js';
import { resolvePlatforms } from '../physics/platforms.js';
import { resolveBlast } from '../physics/blastZones.js';
import { solveSkeleton } from '../skeleton/solveSkeleton.js';
import { maybeStartAttack } from '../combat/startAttack.js';
import { updateShield } from '../combat/shields.js';
import { resolveAttacks } from '../combat/attackResolver.js';
import { resolveWeaponPickups, syncHeldWeapons } from '../weapons/weaponPickup.js';
import { addEventParticles, stepParticles } from '../particles/particles.js';
/** B"H — one tick: input descends, combat erupts, souls remain or fall. */
export function stepState(state,input){ state.frame++; driveBots(state); for(const f of state.fighters){ if(f.dead)continue; const i=f.human?input:f.input; f.stun=Math.max(0,f.stun-1); updateShield(f,i); maybeStartAttack(f,i); applyMovement(f,i); integrate(f); resolvePlatforms(f,state.map); solveSkeleton(f); resolveBlast(f,state.map); } resolveAttacks(state); resolveWeaponPickups(state); syncHeldWeapons(state); addEventParticles(state); stepParticles(state); const alive=state.fighters.filter(f=>!f.dead); state.winner=alive.length===1?alive[0].name:''; }
