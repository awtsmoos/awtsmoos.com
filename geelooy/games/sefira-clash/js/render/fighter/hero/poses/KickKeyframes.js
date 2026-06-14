/**
 * B"H
 * Stable kick keyframe.
 *
 * Chapter 212: kick is no longer a broken contortion. It extends enough to read
 * as a kick while keeping the torso and support leg whole.
 */
import { add, smooth } from '../math.js';

export function applyKickKeyframe(p, f) {
  const a = f.attack || {};
  const s = p.scale || 1;
  const face = p.face;
  const span = Math.max(1, (a.startup || 5) + (a.active || 8) + (a.recovery || 8));
  const t = Math.max(0.4, smooth(Math.min(1, (f.attackFrame || 0) * 0.24 / span)));
  const side = face > 0 ? 'right' : 'left';
  const other = side === 'right' ? 'left' : 'right';
  const reach = (a.fullCharge ? 66 : 56) * s;
  p.chest = add(p.chest, -face * 2.5 * s, -2 * s);
  p.neck = add(p.neck, -face * 2 * s, -2 * s);
  p.head = add(p.head, -face * 1.5 * s, -2 * s);
  p.leftHand = add(p.leftHand, -face * 6 * s, -7 * s);
  p.rightHand = add(p.rightHand, -face * 6 * s, -7 * s);
  p[side + 'Knee'] = add(p[side + 'Hip'], face * reach * 0.44, -26 * s);
  p[side + 'Foot'] = add(p[side + 'Hip'], face * reach * t, -36 * s);
  p[other + 'Knee'] = add(p[other + 'Hip'], -face * 8 * s, 52 * s);
  p[other + 'Foot'] = add(p[other + 'Hip'], -face * 18 * s, 66 * s);
  return p;
}
