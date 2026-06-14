/**
 * B"H
 * Authored attack pose.
 *
 * Chapter 164: attack silhouettes become readable icons: punch reaches, kick
 * extends, and the opposite limb balances like the mockup demanded.
 */
import { offsetPose, smooth } from './poseMixer.js';

export function attackPose(base, f) {
  const attack = f.attack || f.rapidAttack;
  if (!attack) return base;
  const frame = f.attack ? f.attackFrame || 0 : f.rapidAttackFrame || 0;
  const span = Math.max(1, (attack.startup || 5) + (attack.active || 7) + (attack.recovery || 8));
  const t = smooth(Math.min(1, frame * 0.34 / span));
  if (attack.id?.includes('kick') || attack.id === 'roundhouse' || attack.id === 'meteorKick') return kick(base, attack, t);
  return punch(base, attack, t);
}

function punch(base, attack, t) {
  const face = base.face;
  const side = face > 0 ? 'right' : 'left';
  const other = side === 'right' ? 'left' : 'right';
  const reach = attack.fullCharge ? 74 : attack.rapid ? 52 : 62;
  const punchT = attack.rapid ? Math.max(.6, t) : Math.max(.42, t);
  return offsetPose(base, {
    chest: { x: face * 5 * punchT, y: -2 },
    head: { x: face * 3 * punchT, y: -1 },
    [side + 'Elbow']: { x: face * reach * .43, y: -34 },
    [side + 'Hand']: { x: face * reach, y: -36 },
    [other + 'Elbow']: { x: -face * 20, y: -2 },
    [other + 'Hand']: { x: -face * 30, y: -10 }
  });
}

function kick(base, attack, t) {
  const face = base.face;
  const side = face > 0 ? 'right' : 'left';
  const other = side === 'right' ? 'left' : 'right';
  const reach = attack.fullCharge ? 84 : 70;
  const kickT = Math.max(.48, t);
  return offsetPose(base, {
    chest: { x: -face * 4, y: -5 },
    leftHand: { x: -face * 10, y: -12 },
    rightHand: { x: -face * 10, y: -12 },
    [side + 'Knee']: { x: face * reach * .48, y: -66 },
    [side + 'Foot']: { x: face * reach * kickT, y: -86 },
    [other + 'Knee']: { x: -face * 10, y: 0 },
    [other + 'Foot']: { x: -face * 22, y: 0 }
  });
}
