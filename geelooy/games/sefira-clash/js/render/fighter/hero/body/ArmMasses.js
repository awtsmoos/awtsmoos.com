/**
 * B"H
 * Sculpted arm masses.
 *
 * Chapter 200: the arm becomes two visible masses, not a line. Upper arm and
 * forearm each carry suit weight before the glove seals the strike.
 */
import { heroSegment } from './segment.js';
import { MOCKUP } from '../converter/MockupMeasurements.js';
import { ARM_PARTS } from '../converter/HeroPartMap.js';
import { backArmSide, frontArmSide } from '../converter/HeroDepth.js';

export function drawArmLayer(ctx, p, mat, layer) {
  const desired = layer === 'back' ? backArmSide(p.face) : frontArmSide(p.face);
  for (const part of ARM_PARTS) if (part.side === desired) drawArm(ctx, p, mat, part);
}

function drawArm(ctx, p, mat, part) {
  const s = p.scale || 1;
  heroSegment(ctx, p[part.shoulder], p[part.elbow], MOCKUP.arms.upperWidth * s, mat.accent, true);
  heroSegment(ctx, p[part.elbow], p[part.hand], MOCKUP.arms.lowerWidth * s, mat.accent, false);
}
