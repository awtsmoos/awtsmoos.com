import { punchCamera } from '../camera/camera.js';
import { anchors } from '../skeleton/anchors.js';
import { circleHit } from '../core/collision.js';
import { applyKnockback } from '../physics/knockback.js';
import { shieldAbsorb } from './shields.js';

/**
 * B"H
 * Combat contact resolver.
 *
 * Chapter 62: every hit now wounds the whole world and remembers sequence.
 * Combo glyphs rise by count, danger is announced, camera flinches, hitstop
 * freezes consequence, and rivalry memory bends future decisions.
 */
export function resolveAttacks(state) {
  tickCombos(state.fighters);
  for (let i = 0; i < state.fighters.length; i++) {
    const attacker = state.fighters[i];
    if (!attacker.attack || attacker.dead) continue;
    attacker.attackFrame++;
    if (isActive(attacker)) hitWith(attacker, state);
    if (isFinished(attacker)) endAttack(attacker);
  }
}

function tickCombos(fighters) {
  for (let i = 0; i < fighters.length; i++) {
    const c = fighters[i].combo;
    if (!c) continue;
    c.timer = Math.max(0, c.timer - 1);
    if (!c.timer) c.count = 0;
  }
}

function isActive(f) {
  return f.attackFrame > f.attack.startup && f.attackFrame <= f.attack.startup + f.attack.active;
}

function isFinished(f) {
  return f.attackFrame > f.attack.startup + f.attack.active + f.attack.recovery;
}

function endAttack(f) {
  f.attack = null;
  f.attackFrame = 0;
}

function hitWith(attacker, state) {
  const attack = attacker.attack;
  const point = strikePoint(attacker, attack);
  const radius = attack.radius + (attacker.heldWeapon?.range || 0) * 0.35;
  for (let i = 0; i < state.fighters.length; i++) {
    const target = state.fighters[i];
    if (cannotHit(attacker, target, attack)) continue;
    if (!circleHit(point, { x: target.x, y: target.y - 88 }, radius)) continue;
    attack.hasHit.add(target.id);
    rememberAttacker(target, attacker);
    if (absorbByOhrShield(state, target)) continue;
    if (target.blocking && attack.id !== 'grab') shieldHit(state, target, attack);
    else landHit(state, attacker, target, attack);
  }
}

function cannotHit(attacker, target, attack) {
  return target === attacker || target.dead || attack.hasHit.has(target.id);
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

function landHit(state, attacker, target, attack) {
  const weapon = attacker.heldWeapon;
  const fist = attacker.buffs?.gevurahFist ? 1.45 : 1;
  const damage = Math.max(1, Math.round((attack.damage + (weapon?.damage || 0)) * fist));
  const combo = updateCombo(attacker, target);
  target.damage += damage;
  target.danger = target.damage > 120;
  const force = Math.max(damage, attack.knock * fist + (weapon?.knock || 0));
  applyKnockback(target, attacker, { ...attack, damage, knock: attack.knock * fist }, weapon);
  state.hitstop = Math.max(state.hitstop || 0, Math.min(7, 2 + Math.floor(force / 8)));
  punchCamera(state, Math.min(18, force * 0.45));
  emitHit(state, attacker, target, attack, damage, weapon, force, combo);
}

function updateCombo(attacker, target) {
  attacker.combo ||= { count: 0, timer: 0, lastTarget: null };
  const sameTarget = attacker.combo.lastTarget === target.id && attacker.combo.timer > 0;
  attacker.combo.count = sameTarget ? attacker.combo.count + 1 : 1;
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
  state.events.push({ type: 'hit', x: target.x, y: target.y - 92,
    color: '#9affc5', letter: 'מ', damage: Math.round(attack.damage / 2), charge: 0, force: attack.knock * 0.5 });
  punchCamera(state, 4);
}

function emitHit(state, attacker, target, attack, damage, weapon, force, combo) {
  const side = Math.sign(target.x - attacker.x) || attacker.face || 1;
  const comboLetter = combo >= 20 ? 'כ' : combo >= 10 ? 'י' : combo >= 5 ? 'ה' : attack.letter || 'כ';
  state.events.push({ type: 'hit', x: target.x, y: target.y - 106,
    color: weapon?.color || `hsl(${attacker.dna.hue} 95% 70%)`, side,
    letter: comboLetter, damage, force, koDanger: target.damage > 120,
    combo, charge: attack.charge || 0 });
  if (combo >= 3) state.events.push({ type: 'narrative', x: target.x, y: target.y - 145, text: `${combo} מכות`, color: '#fff4a8' });
}
