/**
 * B"H
 * Force influence bridge.
 *
 * The Awtsmoos carries force through the visual vessel: foot to hip, hip to
 * chest, chest to head, shoulder to hand. This emits composer influences only;
 * it never changes gameplay motion.
 */
import { influence } from '../compose/poseInfluence.js';
import { PRIORITY } from '../compose/posePriority.js';
import { weightGrounded, weightAir, weightSpeed, weightImpact, weightAttack } from '../compose/poseWeights.js';

export function forceInfluences(f, m, intent, forces, body) {
  const s = body.height;
  const face = m.facing;
  const speed = weightSpeed(m);
  const impact = weightImpact(m);
  const attack = weightAttack(f);
  const grounded = weightGrounded(m);
  const air = weightAir(m);
  return [
    influence('hip', face * (forces.footToHip || 0) * 5 * s, impact * 3 * s, grounded, PRIORITY.contact, 'foot force to hip'),
    influence('chest', face * (forces.hipToChest || 0) * 8 * s, -(forces.hipToChest || 0) * 2 * s, 0.4 + speed, PRIORITY.secondary, 'hip force to chest'),
    influence('head', face * (forces.chestToHead || 0) * 5 * s, -(forces.chestToHead || 0) * 2 * s, 0.5 + air * 0.4, PRIORITY.secondary, 'chest force to head'),
    influence('rightHand', face * (forces.shoulderWhip || 0) * 8 * s, 0, attack, PRIORITY.combat, 'shoulder whip')
  ];
}
