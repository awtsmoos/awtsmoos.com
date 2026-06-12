import { punchCamera } from '../camera/camera.js';
import { circleHit } from '../core/collision.js';
import { rememberRapidJailHit } from '../ai/advanced/combat/hitEscapeIntent.js';
import { damageAfterDefense, knockAfterHat } from '../fighters/applyHatStats.js';
import { buildFighterBroadphase, nearbyFighters } from '../performance/broadphase.js';
import { applyKnockback } from '../physics/knockback.js';
import { addBattlefieldScar } from '../stage/scars/battlefieldScars.js';
import { anchors } from '../skeleton/anchors.js';
import { beginGrab } from './grabResolver.js';
import { shieldAbsorb } from './shields.js';

/**
 * B"H
 * Combat resolver with concrete powerup force.
 *
 * Chapter 190: Gevurah, Heavy Gloves, and Rage Scroll now turn pickups into
 * felt combat. Damage, launch, hitstop, stun, and scars all read one lawful
 * force calculation before the arena tells the story.
 */
export function resolveAttacks(state) {
  tickCombos(state.fighters);
  const tree = buildFighterBroadphase(state.fighters, state.map);
  for (const attacker of state.fighters) {
    if (attacker.dead) continue;
    stepAttackSlot(attacker, state, tree, 'attack', 'attackFrame');
    stepAttackSlot(attacker, state, tree, 'rapidAttack', 'rapidAttackFrame');
  }
}

function tickCombos(fighters) {
  for (const f of fighters) {
    if (!f.combo) continue;
    f.combo.timer = Math.max(0, f.combo.timer - 1);
    if (!f.combo.timer) f.combo.count = 0;
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
  const candidates = nearbyFighters(tree, point.x, point.y, radius);
  for (const target of candidates) {
    if (cannotHit(attacker, target, attack)) continue;
    if (!attackConnects(attacker, target, point, radius, attack)) continue;
    attack.hasHit.add(target.id);
    rememberAttacker(target, attacker);
    if (attack.id === 'grab') return landGrab(state, attacker, target, slot);
    if (absorbByOhrShield(state, attacker, target, attack)) continue;
    if (target.blocking) shieldHit(state, attacker, target, attack);
    else landHit(state, attacker, target, attack);
  }
}

function attackConnects(attacker, target, point, radius, attack) {
  const hurt = { x: target.x, y: target.y - 88 };
  return circleHit(point, hurt, radius) || closeBodyHit(attacker, target, attack);
}

function closeBodyHit(attacker, target, attack) {
  const dx = (target.x - attacker.x) * (attacker.face || 1);
  const dy = Math.abs((target.y - 88) - (attacker.y - 92));
  if (attack.id === 'grab') return Math.abs(target.x - attacker.x) < 92 && dy < 130;
  return dx >= -46 && dx <= closeReach(attack) && dy <= 122;
}

function closeReach(attack) {
  if (attack.id === 'sweep') return 126;
  if (attack.id?.includes('Kick') || attack.id === 'roundhouse') return 150;
  if (attack.id === 'dashPunch' || attack.id === 'chargePunch') return 146;
  return 118;
}

function cannotHit(attacker, target, attack) {
  return target === attacker || target.dead || target.hidden || target.grabbedBy || attack.hasHit.has(target.id);
}

function rememberAttacker(target, attacker) {
  target.ai ||= {};
  target.ai.lastAttacker = attacker.id;
  target.ai.lastAttackerName = attacker.name;
}

function strikePoint(attacker, attack) {
  const body = anchors(attacker);
  if (attack.limb === 'rightFoot') return body.rightFoot;
  if (attack.limb === 'weaponTip') return body.weaponTip;
  return body.rightHand;
}

function landGrab(state, attacker, target, slot) {
  beginGrab(attacker, target);
  state.events.push({ type: 'hit', attackerId: attacker.id, targetId: target.id, human: attacker.human || target.human, x: target.x, y: target.y - 105, color: '#ffe8a8', letter: 'אחיזה', damage: 0, force: 8, side: attacker.face || 1 });
  punchCamera(state, 5);
  endAttack(attacker, slot, slot === 'rapidAttack' ? 'rapidAttackFrame' : 'attackFrame');
}

function landHit(state, attacker, target, attack) {
  const weapon = attack.rapid ? null : attacker.heldWeapon;
  const power = attackPower(attacker);
  const raw = Math.max(1, Math.round((attack.damage + (weapon?.damage || 0)) * power.damage));
  const damage = damageAfterDefense(target, raw);
  const combo = updateCombo(attacker, target);
  target.damage += damage;
  target.danger = target.damage > 120;
  rememberRapidJailHit(target, attacker, attack);
  const knock = knockAfterHat(attacker, attack.knock * power.knock + (weapon?.knock || 0));
  const force = Math.max(damage, knock);
  applyKnockback(target, attacker, { ...attack, damage, knock }, weapon);
  state.hitstop = Math.max(state.hitstop || 0, Math.min(7, attack.rapid ? 1 : 2 + Math.floor(force / 8)));
  punchCamera(state, attack.rapid ? 2 : Math.min(18, force * 0.45));
  emitHit(state, attacker, target, attack, damage, weapon, force, combo);
}

function attackPower(attacker) {
  return {
    damage: attacker.buffs?.gevurahFist ? 1.45 : attacker.buffs?.rageScroll ? 1.1 : 1,
    knock: attacker.buffs?.heavyGloves ? 1.24 : attacker.buffs?.gevurahFist ? 1.1 : 1
  };
}

function updateCombo(attacker, target) {
  attacker.combo ||= { count: 0, timer: 0, lastTarget: null };
  const same = attacker.combo.lastTarget === target.id && attacker.combo.timer > 0;
  attacker.combo.count = same ? attacker.combo.count + 1 : 1;
  attacker.combo.timer = 95;
  attacker.combo.lastTarget = target.id;
  return attacker.combo.count;
}

function absorbByOhrShield(state, attacker, target) {
  if (!target.buffs?.ohrShield) return false;
  delete target.buffs.ohrShield;
  state.events.push({ type: 'hit', attackerId: attacker.id, targetId: target.id, human: attacker.human || target.human, x: target.x, y: target.y - 96, color: '#fff1a6', letter: 'א', damage: 0, charge: 0, force: 8 });
  punchCamera(state, 5);
  return true;
}

function shieldHit(state, attacker, target, attack) {
  shieldAbsorb(target, attack.damage);
  state.events.push({ type: 'hit', attackerId: attacker.id, targetId: target.id, human: attacker.human || target.human, x: target.x, y: target.y - 92, color: '#9affc5', letter: 'מ', damage: Math.round(attack.damage / 2), force: attack.knock * 0.5, rapid: attack.rapid });
  punchCamera(state, attack.rapid ? 2 : 4);
}

function emitHit(state, attacker, target, attack, damage, weapon, force, combo) {
  const side = Math.sign(attack.aim?.x || target.x - attacker.x) || attacker.face || 1;
  const letter = combo >= 20 ? 'כ' : combo >= 10 ? 'י' : combo >= 5 ? 'ה' : attack.letter || 'כ';
  const event = { type: 'hit', attackerId: attacker.id, targetId: target.id, human: attacker.human || target.human, x: target.x, y: target.y - 106, color: weapon?.color || `hsl(${attacker.dna.hue} 95% 70%)`, side, letter, damage, force, koDanger: target.damage > 120, combo, charge: attack.charge || 0, fullCharge: attack.fullCharge, rapid: attack.rapid };
  state.events.push(event);
  addBattlefieldScar(state, event);
  if (combo >= 3) state.events.push({ type: 'narrative', x: target.x, y: target.y - 145, text: `${combo}x`, color: '#fff4a8' });
}
