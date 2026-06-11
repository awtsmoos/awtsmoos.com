import { paletteFor } from './background/palette.js';
import { parchmentTexture } from './background/parchmentTexture.js';
import { drawTreeOfLife } from './background/treeOfLife.js';

/**
 * B"H — Background renderer, upgraded toward the reference image: parchment
 * surface, aged stains, faded sefirah geometry, and map-specific mood.
 */
export function drawBackground(ctx, map, w, h) {
  const palette = paletteFor(map);
  const texture = parchmentTexture(Math.max(64, Math.floor(w)), Math.max(64, Math.floor(h)), palette);
  ctx.drawImage(texture, 0, 0, w, h);
  drawCloudInk(ctx, w, h, palette);
  drawTreeOfLife(ctx, w, h, palette);
}

function drawCloudInk(ctx, w, h, palette) {
  ctx.save();
  ctx.globalAlpha = 0.12;
  ctx.strokeStyle = palette.ink;
  for (let i = 0; i < 16; i++) {
    const y = h * 0.22 + Math.sin(i * 1.7) * 18;
    ctx.beginPath();
    for (let x = -40; x < w + 40; x += 42) {
      const yy = y + Math.sin(x * .012 + i) * 22;
      if (x < 0) ctx.moveTo(x, yy); else ctx.lineTo(x, yy);
    }
    ctx.stroke();
  }
  ctx.restore();
}
