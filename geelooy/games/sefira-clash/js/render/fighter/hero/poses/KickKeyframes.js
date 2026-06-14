/** B"H — Kick keyframe: high readable extension like the target board. */
import { add, smooth } from '../math.js';
export function applyKickKeyframe(p, f) {
  const a = f.attack || {}, s = p.scale || 1, face = p.face;
  const span = Math.max(1, (a.startup || 5) + (a.active || 8) + (a.recovery || 8));
  const t = Math.max(.52, smooth(Math.min(1, (f.attackFrame || 0) * .3 / span)));
  const side = face > 0 ? 'right' : 'left', other = side === 'right' ? 'left' : 'right';
  const reach = (a.fullCharge ? 92 : 78) * s;
  p.chest = add(p.chest, -face * 5 * s, -5 * s); p.neck = add(p.neck, -face * 4 * s, -5 * s); p.head = add(p.head, -face * 3 * s, -5 * s);
  p.leftHand = add(p.leftHand, -face * 10 * s, -12 * s); p.rightHand = add(p.rightHand, -face * 10 * s, -12 * s);
  p[side + 'Knee'] = add(p[side + 'Hip'], face * reach * .48, -66 * s); p[side + 'Foot'] = add(p[side + 'Hip'], face * reach * t, -88 * s);
  p[other + 'Knee'] = add(p[other + 'Hip'], -face * 12 * s, 54 * s); p[other + 'Foot'] = add(p[other + 'Hip'], -face * 24 * s, 94 * s);
  return p;
}
