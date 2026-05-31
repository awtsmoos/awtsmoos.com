/**
 * B"H
 * @module WorldPrimitives
 *
 * Chapter 40: Small pixels learned to become leaves, stones, and sparks.
 * The Awtsmoos has no body and no form; these pure helpers are the tiny tools
 * by which procedural rectangles become a living garden instead of flat tiles.
 */
import { WORLD_COLORS as C, pick, seeded } from './WorldPalette.js';

export const pixel = (ctx, x, y, w, h, color) => {
  ctx.fillStyle = color;
  ctx.fillRect(Math.floor(x), Math.floor(y), Math.ceil(w), Math.ceil(h));
};

export const glow = (ctx, x, y, r, color = C.glow) => {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, color);
  g.addColorStop(1, 'rgba(255,230,120,0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
};

export const stone = (ctx, x, y, size, seed) => {
  ctx.fillStyle = '#9f9a90';
  ctx.beginPath();
  ctx.ellipse(x, y, size * .55, size * .38, seeded(seed) * .5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.16)';
  ctx.beginPath();
  ctx.ellipse(x - size * .14, y - size * .11, size * .18, size * .08, 0, 0, Math.PI * 2);
  ctx.fill();
};

export const flower = (ctx, x, y, size, seed) => {
  pixel(ctx, x, y, 2, size * .38, C.leafLight);
  const color = pick(C.flower, seed);
  for (let i = 0; i < 4; i += 1) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x + Math.cos(i * Math.PI / 2) * 3, y + Math.sin(i * Math.PI / 2) * 3, 2.2, 0, Math.PI * 2);
    ctx.fill();
  }
  pixel(ctx, x - 1, y - 1, 2, 2, C.gold);
};

export const grassBlade = (ctx, x, y, h, color = C.leaf) => {
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.25;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x - 2, y - h);
  ctx.moveTo(x, y);
  ctx.lineTo(x + 2, y - h * .8);
  ctx.stroke();
};
