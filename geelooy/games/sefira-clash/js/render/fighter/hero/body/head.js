/** B"H — Hero head aggregator: helmet shell plus visor blade. */
import { drawHelmetShell } from './HelmetShell.js';
import { drawVisorShape } from './VisorShape.js';
export function drawHeroHead(ctx, p, mat) {
  drawHelmetShell(ctx, p, mat);
  drawVisorShape(ctx, p, mat);
}
