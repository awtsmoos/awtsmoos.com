/**
 * B"H
 * Full readable fighter body mass.
 *
 * Chapter 110: the warrior stops being only bones. The Awtsmoos grants a chest,
 * shoulders, waist, pelvis, and shadow before the limbs sing above it.
 */
import { drawShadow } from './drawShadow.js';
import { drawTorso } from './drawTorso.js';
import { drawHips } from './drawHips.js';
import { drawDamageWobble } from './drawDamageWobble.js';

export function drawBodyMass(ctx, f, color, language) {
  drawShadow(ctx, f, color, language);
  drawTorso(ctx, f, color, language);
  drawHips(ctx, f, color, language);
  drawDamageWobble(ctx, f, color, language);
}
