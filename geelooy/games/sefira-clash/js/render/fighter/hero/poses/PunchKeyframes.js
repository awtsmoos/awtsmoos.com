/** B"H — Punch keyframe: readable full-body strike. */
import { add, smooth } from '../math.js';
export function applyPunchKeyframe(p, f) {
  const a = f.attack || f.rapidAttack || {}, s = p.scale || 1, face = p.face;
  const span = Math.max(1, (a.startup || 5) + (a.active || 7) + (a.recovery || 8));
  const raw = f.attack ? f.attackFrame || 0 : f.rapidAttackFrame || 0;
  const t = Math.max(a.rapid ? .6 : .45, smooth(Math.min(1, raw * .3 / span)));
  const side = face > 0 ? 'right' : 'left', other = side === 'right' ? 'left' : 'right';
  const reach = (a.fullCharge ? 86 : a.rapid ? 58 : 72) * s;
  p.chest = add(p.chest, face * 5 * t * s, -2 * s); p.neck = add(p.neck, face * 4 * t * s, -2 * s); p.head = add(p.head, face * 3 * t * s, -1 * s);
  p[side + 'Elbow'] = add(p[side + 'Shoulder'], face * reach * .45, 5 * s); p[side + 'Hand'] = add(p[side + 'Shoulder'], face * reach, 6 * s);
  p[other + 'Elbow'] = add(p[other + 'Shoulder'], -face * 22 * s, 43 * s); p[other + 'Hand'] = add(p[other + 'Shoulder'], -face * 32 * s, 80 * s);
  return p;
}
