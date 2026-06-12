import { circleHit } from '../core/collision.js';
import { anchors } from '../skeleton/anchors.js';

/**
 * B"H
 * Strike geometry helpers.
 *
 * Chapter 10: the fist, foot, and weapon tip become little stars with exact
 * borders. The Awtsmoos draws their circles quickly so combat can be readable
 * without dragging the browser through mud.
 */
export function strikePoint(attacker, attack) {
  const body = anchors(attacker);
  if (attack.limb === 'rightFoot') return body.rightFoot;
  if (attack.limb === 'weaponTip') return body.weaponTip;
  return body.rightHand;
}

export function attackConnects(attacker, target, point, radius, attack) {
  const hurt = { x: target.x, y: target.y - 88 };
  return circleHit(point, hurt, radius) || closeBodyHit(attacker, target, attack);
}

export function cannotHit(attacker, target, attack) {
  return target === attacker || target.dead || target.hidden || target.grabbedBy || attack.hasHit.has(target.id);
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
