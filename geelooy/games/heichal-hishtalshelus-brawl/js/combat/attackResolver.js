import { anchors } from '../skeleton/anchors.js';
import { circleHit } from '../core/collision.js';
import { applyKnockback } from '../physics/knockback.js';
import { shieldAbsorb } from './shields.js';
/** B"H — hit resolution: contact, shield, damage, knockback, sparks. */
export function resolveAttacks(state){ for(const a of state.fighters){ if(!a.attack||a.dead)continue; a.attackFrame++; const live=a.attackFrame>a.attack.startup&&a.attackFrame<=a.attack.startup+a.attack.active; if(live)hitWith(a,state); if(a.attackFrame>a.attack.startup+a.attack.active+a.attack.recovery){a.attack=null;a.attackFrame=0;} } }
function hitWith(a,state){ const attack=a.attack; const p=anchors(a)[attack.limb]||anchors(a).rightHand; const radius=attack.radius+(a.heldWeapon?.range||0)*.35; for(const t of state.fighters){ if(t===a||t.dead||attack.hasHit.has(t.id))continue; if(!circleHit(p,{x:t.x,y:t.y-42},radius))continue; attack.hasHit.add(t.id); if(t.blocking&&attack.id!=='grab'){shieldAbsorb(t,attack.damage);continue;} const weapon=a.heldWeapon; t.damage+=attack.damage+(weapon?.damage||0); applyKnockback(t,a,attack,weapon); state.events.push({type:'hit',x:t.x,y:t.y-45,color:weapon?.color||'#fff2a8'}); } }
