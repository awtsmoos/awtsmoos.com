/**
 * B"H
 * Cleaner punch keyframe.
 *
 * Chapter 224: the punch reads as a strike without tearing the arm into a spear.
 */
import { add, smooth } from '../math.js';

export function applyPunchKeyframe(p, f) {
  const a = f.attack || f.rapidAttack || {};
  const s = p.scale || 1;
  const face = p.face;
  const span = Math.max(1, (a.startup || 5) + (a.active || 7) + (a.recovery || 8));
  const raw = f.attack ? f.attackFrame || 0 : f.rapidAttackFrame || 0;
  const t = Math.max(a.rapid ? 0.35 : 0.28, smooth(Math.min(1, raw * 0.22 / span)));
  const side = face > 0 ? 'right' : 'left';
  const other = side === 'right' ? 'left' : 'right';
  const reach = (a.fullCharge ? 54 : a.rapid ? 36 : 46) * s;
  p.chest = add(p.chest, face * 1.8 * t * s, -0.8 * s);
  p.neck = add(p.neck, face * 1.6 * t * s, -0.8 * s);
  p.head = add(p.head, face * 1.2 * t * s, 0);
  p[side + 'Elbow'] = add(p[side + 'Shoulder'], face * reach * 0.48, 19 * s);
  p[side + 'Hand'] = add(p[side + 'Shoulder'], face * reach, 19 * s);
  p[other + 'Elbow'] = add(p[other + 'Shoulder'], -face * 11 * s, 43 * s);
  p[other + 'Hand'] = add(p[other + 'Shoulder'], -face * 16 * s, 68 * s);
  return p;
}
