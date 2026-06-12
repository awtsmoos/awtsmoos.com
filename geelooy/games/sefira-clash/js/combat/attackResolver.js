import { punchCamera } from '../camera/camera.js';
import { COMBAT_TUNING } from '../data/combatTuning.js';
import { rememberRapidJailHit } from '../ai/advanced/combat/hitEscapeIntent.js';
import { buildFighterBroadphase, nearbyFighters } from '../performance/broadphase.js';
import { applyKnockback } from '../physics/knockback.js';
import { addBattlefieldScar } from '../stage/scars/battlefieldScars.js';
import { recordComboHit, tickComboState } from './comboSystem.js';
import { buildHitEvent, pushComboAnnouncements, pushLaunchDebug, registerHitDiagnostics } from './combatEvents.js';
import { attackConnects, cannotHit, strikePoint } from './attackGeometry.js';
import { applyHitstop, damageFor, knockFor } from './attackMath.js';
import { beginGrab } from './grabResolver.js';
import { shieldAbsorb } from './shields.js';

/** B"H — Chapter 29: every real hit wakes dive-stun and every rapid spark launches honestly. */
export function resolveAttacks(state) {
  tickComboState(state.fighters);
  const tree = buildFighterBroadphase(state.fighters, state.map);
  for (const attacker of state.fighters) {
    if (attacker.dead) continue;
    stepAttackSlot(attacker, state, tree, 'attack', 'attackFrame');
    stepAttackSlot(attacker, state, tree, 'rapidAttack', 'rapidAttackFrame');
  }
}

function stepAttackSlot(attacker, state, tree, slot, frameKey) {
  const attack = attacker[slot];
  if (!attack) return;
  attacker[frameKey] = (attacker[frameKey] || 0) + 1;
  if (isActive(attacker, attack, frameKey)) hitWith(attacker, state, tree, attack, slot);
  if (attacker[slot] && isFinished(attacker, attack, frameKey)) endAttack(attacker, slot, frameKey);
}

function isActive(f, attack, frameKey) { return f[frameKey] > attack.startup && f[frameKey] <= attack.startup + attack.active; }
function isFinished(f, attack, frameKey) { return f[frameKey] > attack.startup + attack.active + attack.recovery; }
function endAttack(f, slot, frameKey) { f[slot] = null; f[frameKey] = 0; }

function hitWith(attacker, state, tree, attack, slot) {
  const point = strikePoint(attacker, attack);
  const radius = attack.radius + (attacker.heldWeapon?.range || 0) * 0.35 + 150;
  for (const target of nearbyFighters(tree, point.x, point.y, radius)) {
    if (cannotHit(attacker, target, attack)) continue;
    if (!attackConnects(attacker, target, point, radius, attack)) continue;
    attack.hasHit.add(target.id);
    rememberAttacker(target, attacker);
    if (attack.id === 'grab') return landGrab(state, attacker, target, slot);
    if (absorbByOhrShield(state, attacker, target)) continue;
    if (target.blocking) shieldHit(state, attacker, target, attack);
    else landHit(state, attacker, target, attack);
  }
}

function rememberAttacker(target, attacker) {
  target.ai ||= {};
  target.ai.lastAttacker = attacker.id;
  target.ai.lastAttackerName = attacker.name;
}

function landGrab(state, attacker, target, slot) {
  beginGrab(attacker, target);
  state.events.push(simpleHit(attacker, target, { letter: 'אחיזה', damage: 0, force: 8, color: '#ffe8a8' }));
  punchCamera(state, 5);
  endAttack(attacker, slot, slot === 'rapidAttack' ? 'rapidAttackFrame' : 'attackFrame');
}

function landHit(state, attacker, target, attack) {
  wakeDiveStun(target);
  const weapon = attack.rapid ? null : attacker.heldWeapon;
  const damage = damageFor(attacker, target, attack, weapon);
  state.totalDamageDealt = (state.totalDamageDealt || 0) + damage;
  target.damage += damage;
  target.danger = target.damage >= COMBAT_TUNING.launch.killDangerPercent;
  rememberRapidJailHit(target, attacker, attack);
  const knock = knockFor(attacker, attack, weapon);
  const vector = applyKnockback(target, attacker, { ...attack, damage, knock }, weapon);
  const force = Math.max(damage, knock, vector.force || 0);
  const combo = recordComboHit(state, attacker, target, damage, attack);
  applyHitstop(state, attack, force);
  punchCamera(state, attack.rapid ? 1.4 : Math.min(18, force * 0.45));
  emitHit(state, attacker, target, attack, damage, weapon, force, combo, vector);
}

function wakeDiveStun(target) {
  target.diveStunned = 0;
  if (target.stun && target.comboPressure?.count) target.stun = Math.min(target.stun, 6);
}

function absorbByOhrShield(state, attacker, target) {
  if (!target.buffs?.ohrShield) return false;
  delete target.buffs.ohrShield;
  state.events.push(simpleHit(attacker, target, { letter: 'א', damage: 0, force: 8, color: '#fff1a6' }));
  punchCamera(state, 5);
  return true;
}

function shieldHit(state, attacker, target, attack) {
  shieldAbsorb(target, attack.damage);
  const damage = Math.round(attack.damage / 2);
  state.totalDamageDealt = (state.totalDamageDealt || 0) + damage;
  state.events.push(simpleHit(attacker, target, { letter: 'מ', damage, force: attack.knock * 0.5, rapid: attack.rapid, color: '#9affc5' }));
  punchCamera(state, attack.rapid ? 1 : 4);
}

function emitHit(state, attacker, target, attack, damage, weapon, force, combo, vector) {
  const letter = combo.count >= 20 ? 'כ' : combo.count >= 10 ? 'י' : combo.count >= 5 ? 'ה' : attack.letter || 'כ';
  const event = buildHitEvent(attacker, target, attack, { color: weapon?.color || `hsl(${attacker.dna.hue} 95% 70%)`, letter, damage, force, combo, vector });
  state.events.push(event);
  registerHitDiagnostics(state, attack, event);
  addBattlefieldScar(state, event);
  pushComboAnnouncements(state, attacker, target, combo);
  pushLaunchDebug(state, target, vector);
}

function simpleHit(attacker, target, data) {
  return { type: 'hit', attackerId: attacker.id, targetId: target.id, human: attacker.human || target.human, x: target.x, y: target.y - 106, side: attacker.face || 1, ...data };
}
