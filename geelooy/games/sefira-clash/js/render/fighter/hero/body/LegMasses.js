/**
 * B"H
 * Sculpted leg masses.
 *
 * Chapter 201: thighs and shins become strong black suit pieces, accented with
 * living color and ending in planted boots.
 */
import { heroSegment } from './segment.js';
import { MOCKUP } from '../converter/MockupMeasurements.js';
import { LEG_PARTS } from '../converter/HeroPartMap.js';

export function drawLegMasses(ctx, p, mat) {
  const s = p.scale || 1;
  for (const part of LEG_PARTS) {
    heroSegment(ctx, p[part.hip], p[part.knee], MOCKUP.legs.thighWidth * s, mat.accent, true);
    heroSegment(ctx, p[part.knee], p[part.foot], MOCKUP.legs.shinWidth * s, mat.accent, false);
  }
}
