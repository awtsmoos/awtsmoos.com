/**
 * B"H
 * Hyper-real head renderer orchestrator.
 *
 * Face, headwear, eye system, and expression are now separate visible vessels.
 */
import { drawFace } from './drawFace.js';
import { drawEye } from './drawEye.js';
import { drawHeadwear } from './drawHeadwear.js';
import { drawExpression } from './drawExpression.js';
export function drawHead(ctx, f, color, language) {
  const head = f.bones.head?.tip || { x: f.x, y: f.y - 170 };
  const x = head.x + (language.lean || 0) * 8;
  drawFace(ctx, f, x, head.y, color, language);
  drawHeadwear(ctx, f, x, head.y, color);
  drawEye(ctx, f, x, head.y, color, language);
  drawExpression(ctx, f, x, head.y, color, language);
}
