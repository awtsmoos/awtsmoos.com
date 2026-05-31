/**
 * B"H
 * @module NatureRenderer
 *
 * Chapter 43: Trees stopped being blobs and became places to stand beside.
 * The Awtsmoos has no body and no form; every trunk, canopy, shadow, and leaf
 * is generated from seed, so the forest breathes without importing one image.
 */
import { WORLD_COLORS as C, pick, seeded } from './WorldPalette.js';
import { flower, glow, pixel, stone } from './WorldPrimitives.js';

export const drawTree = (ctx, x, y, size, seed = 1) => {
  ctx.save();
  const cx = x + size / 2;
  const cy = y + size / 2;
  ctx.fillStyle = C.shadow;
  ctx.beginPath();
  ctx.ellipse(cx, y + size * .86, size * .48, size * .15, 0, 0, Math.PI * 2);
  ctx.fill();
  pixel(ctx, cx - size * .11, cy - size * .02, size * .22, size * .48, '#4a2b1e');
  pixel(ctx, cx - size * .04, cy + size * .08, size * .08, size * .38, '#6b422a');
  for (let i = 0; i < 7; i += 1) drawLeafMass(ctx, cx, cy, size, seed + i * 11, i);
  if (seeded(seed + 99) > .82) glow(ctx, cx + size * .18, cy - size * .34, size * .18, 'rgba(255,238,130,.26)');
  ctx.restore();
};

const drawLeafMass = (ctx, cx, cy, size, seed, i) => {
  const angle = i * .9;
  const ox = Math.cos(angle) * size * (.12 + seeded(seed) * .2);
  const oy = -size * .32 + Math.sin(angle) * size * .13;
  ctx.fillStyle = pick(C.grass, seed);
  ctx.beginPath();
  ctx.arc(cx + ox, cy + oy, size * (.28 + seeded(seed + 1) * .11), 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.08)';
  ctx.beginPath();
  ctx.arc(cx + ox - size * .08, cy + oy - size * .08, size * .1, 0, Math.PI * 2);
  ctx.fill();
};

export const drawNatureObject = (ctx, x, y, size, glyph, seed = 1) => {
  if (glyph === '⚿' || glyph === '⛰') stone(ctx, x + size / 2, y + size * .62, size * .44, seed);
  else if (glyph === '⚘' || glyph === '✿') flower(ctx, x + size / 2, y + size * .55, size, seed);
  else drawTree(ctx, x, y, size, seed);
};
