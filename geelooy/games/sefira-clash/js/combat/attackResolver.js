import { punchCamera } from '../camera/camera.js';
import { circleHit } from '../core/collision.js';
import { damageAfterDefense, knockAfterHat } from '../fighters/applyHatStats.js';
import { buildFighterBroadphase, nearbyFighters } from '../performance/broadphase.js';
import { applyKnockback } from '../physics/knockback.js';
import { anchors } from '../skeleton/anchors.js';
import { beginGrab } from './grabResolver.js';
import { shieldAbsorb } from './shields.js';

/**
 * B"H
 * Combat resolver with quadtree broadphase.
 *
 * Chapter 247: every active hit no longer asks the whole world. The strike
 * opens a small spatial gate, pulls only nearby fighters from the quadtree, and
 * then runs exact hit logic. Fewer comparisons, same truth, faster melees.
 */
export function resolveAttacks(state) {
  tickCombos(state.fighters);
  const tree = buildFighterBroadphase(state.fighters, state.map);
  for (const attacker of state.fighters) {
    if (!attacker.attack || attacker.dead) continue;
    attacker.attackFrame++;
    if (isActive(attacker)) hitWith(attacker, state, tree);
    if (attacker.attack && isFinished(attacker)) endAttack(attacker);
  }
}

function tickCombos(fighters) {
  for (const f of fighters) {
    if (!f.combo) continue;
    f.combo.timer = Math.max(0, f.combo.timer - 1);
    if (!f.combo.timer) f.combo.count = 0;
  }
}

function isActive(f) { return f.attackFrame > f.attack.startup && f.attackFrame <= f.attack.startup + f.attack.active; }
function isFinished(f) { return f.attackFrame > f.attack.startup + f.attack.active + f.attack.recovery; }
function endAttack(f) { f.attack = null; f.attackFrame = 0; }

function hitWith(attacker, state, tree) {
  const attack = attacker.attack;
  const point = strikePoint(attacker, attack);
  const radius = attack.radius + (attacker.heldWeapon?.range || 0) * 0.35 + 150;
  const candidates = nearbyFighters(tree, point.x, point.y, radius);
  for (const target of candidates) {
    if (cannotHit(attacker, target, attack)) continue;
    if (!attackConnects(attacker, target, point, radius, attack)) continue;
    attack.hasHit.add(target.id);
    rememberAttacker(target, attacker);
    if (attack.id === 'grab') return landGrab(state, attacker, target);
    if (absorbByOhrShield(state, target)) continue;
    if (target.blocking) shieldHit(state, target, attack);
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
  return target === attacker || target.dead || target.grabbedBy || attack.hasHit.has(target.id);
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

function landGrab(state, attacker, target) {
  beginGrab(attacker, target);
  state.events.push({ type: 'hit', x: target.x, y: target.y - 105, color: '#ffe8a8', letter: 'אחיזה', damage: 0, force: 8, side: attacker.face || 1 });
  punchCamera(state, 5);
  endAttack(attacker);
}

function landHit(state, attacker, target, attack) {
  const weapon = attacker.heldWeapon;
  const fist = attacker.buffs?.gevurahFist ? 1.45 : 1;
  const raw = Math.max(1, Math.round((attack.damage + (weapon?.damage || 0)) * fist));
  const damage = damageAfterDefense(target, raw);
  const combo = updateCombo(attacker, target);
  target.damage += damage;
  target.danger = target.damage > 120;
  const knock = knockAfterHat(attacker, attack.knock * fist + (weapon?.knock || 0));
  const force = Math.max(damage, knock);
  applyKnockback(target, attacker, { ...attack, damage, knock }, weapon);
  state.hitstop = Math.max(state.hitstop || 0, Math.min(7, 2 + Math.floor(force / 8)));
  punchCamera(state, Math.min(18, force * 0.45));
  emitHit(state, attacker, target, attack, damage, weapon, force, combo);
}

function updateCombo(attacker, target) {
  attacker.combo ||= { count: 0, timer: 0, lastTarget: null };
  const same = attacker.combo.lastTarget === target.id && attacker.combo.timer > 0;
  attacker.combo.count = same ? attacker.combo.count + 1 : 1;
  attacker.combo.timer = 95;
  attacker.combo.lastTarget = target.id;
  return attacker.combo.count;
}

function absorbByOhrShield(state, target) {
  if (!target.buffs?.ohrShield) return false;
  delete target.buffs.ohrShield;
  state.events.push({ type: 'hit', x: target.x, y: target.y - 96, color: '#fff1a6', letter: 'א', damage: 0, charge: 0, force: 8 });
  punchCamera(state, 5);
  return true;
}

function shieldHit(state, target, attack) {
  shieldAbsorb(target, attack.damage);
  state.events.push({ type: 'hit', x: target.x, y: target.y - 92, color: '#9affc5', letter: 'מ', damage: Math.round(attack.damage / 2), force: attack.knock * 0.5 });
  punchCamera(state, 4);
}

function emitHit(state, attacker, target, attack, damage, weapon, force, combo) {
  const side = Math.sign(attack.aim?.x || target.x - attacker.x) || attacker.face || 1;
  const letter = combo >= 20 ? 'כ' : combo >= 10 ? 'י' : combo >= 5 ? 'ה' : attack.letter || 'כ';
  state.events.push({ type: 'hit', x: target.x, y: target.y - 106, color: weapon?.color || `hsl(${attacker.dna.hue} 95% 70%)`, side, letter, damage, force, koDanger: target.damage > 120, combo, charge: attack.charge || 0, fullCharge: attack.fullCharge, rapid: attack.rapid });
  if (combo >= 3) state.events.push({ type: 'narrative', x: target.x, y: target.y - 145, text: `${combo}x`, color: '#fff4a8' });
}
