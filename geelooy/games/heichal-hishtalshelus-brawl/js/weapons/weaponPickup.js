import { dist2 } from '../core/vectors.js';
/** B"H — pickup binds tool to hand when desire comes near enough. */
export function resolveWeaponPickups(state){ for(const f of state.fighters){ if(f.dead||f.heldWeapon)continue; for(const w of state.weapons){ if(w.held)continue; if(dist2(f,w)<2500){ f.heldWeapon=w; w.held=true; state.events.push({type:'pickup',x:f.x,y:f.y-70,color:w.color}); break; } } } }
export function syncHeldWeapons(state){ for(const f of state.fighters){ if(!f.heldWeapon)continue; f.heldWeapon.x=f.x+f.face*38; f.heldWeapon.y=f.y-62; f.heldWeapon.spin+=.12*f.face; } }
