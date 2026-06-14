/**
 * B"H
 * Stable punch keyframe.
 *
 * Chapter 211: punch is readable, not stretched across the screen. The body
 * remains intact while one glove clearly leads.
 */
import { add, smooth } from '../math.js';

export function applyPunchKeyframe(p, f) {
  const a = f.attack || f.rapidAttack || {};
  const s = p.scale || 1;
  const face = p.face;
  const span = Math.max(1, (a.startup || 5) + (a.active || 7) + (a.recovery || 8));
  const raw = f.attack ? f.attackFrame || 0 : f.rapidAttackFrame || 0;
  const t = Math.max(a.rapid ? 0.45 : 0.36, smooth(Math.min(1, raw * 0.24 / span)));
  const side = face > 0 ? 'right' : 'left';
  const other = side === 'right' ? 'left' : 'right';
  const reach = (a.fullCharge ? 60 : a.rapid ? 42 : 52) * s;
  p.chest = add(p.chest, face * 2.5 * t * s, -1 * s);
  p.neck = add(p.neck, face * 2 * t * s, -1 * s);
  p.head = add(p.head, face * 1.5 * t * s, 0);
  p[side + 'Elbow'] = add(p[side + 'Shoulder'], face * reach * 0.48, 18 * s);
  p[side + 'Hand'] = add(p[side + 'Shoulder'], face * reach, 18 * s);
  p[other + 'Elbow'] = add(p[other + 'Shoulder'], -face * 14 * s, 45 * s);
  p[other + 'Hand'] = add(p[other + 'Shoulder'], -face * 20 * s, 72 * s);
  return p;
}
