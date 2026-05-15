/**
 * B"H
 * @module GlyphRenderer
 */
import { Human } from './Human.js';
import { Architecture } from './Architecture.js';

export const drawGlyphObject = (ctx, item, size) => {
  const { meta, glyph, x, y, rx, ry, seed } = item;
  if (meta.kind === 'wall') Architecture.draw(ctx, x, y, size, rx, ry);
  else if (meta.kind === 'tree') drawTree(ctx, x, y, size, seed);
  else if (meta.kind === 'door') Architecture.drawDoor(ctx, x, y, size);
  else if (meta.kind === 'npc') drawNpc(ctx, x, y, size, glyph);
  else if (meta.kind === 'musag') drawMusag(ctx, x, y, size, glyph, seed);
  else if (meta.kind === 'object') drawObject(ctx, x, y, size, glyph);
};

export const drawNpc = (ctx, x, y, size, glyph) => {
  Human.draw(ctx, x, y, size, 0, 'd');
  ctx.save();
  ctx.fillStyle = '#fff176';
  ctx.font = 'bold 18px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(glyph, x + size / 2, y + 8);
  ctx.restore();
};

export const drawMusag = (ctx, x, y, size, glyph, seed = 1) => {
  ctx.save();
  ctx.translate(x + size / 2, y + size / 2);
  ctx.globalAlpha = 0.88;
  ctx.fillStyle = '#7e57c2';
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.24 + (seed % 4), 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#e1bee7';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.36, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 18px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(glyph, 0, 1);
  ctx.restore();
};

export const drawObject = (ctx, x, y, size, glyph) => {
  ctx.save();
  ctx.translate(Math.floor(x), Math.floor(y));
  ctx.fillStyle = '#5d4037';
  ctx.fillRect(size * 0.18, size * 0.3, size * 0.64, size * 0.45);
  ctx.fillStyle = '#fff8e1';
  ctx.font = 'bold 20px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(glyph, size / 2, size * 0.5);
  ctx.restore();
};

export const drawTree = (ctx, x, y, size, seed = 1) => {
  ctx.save();
  ctx.translate(x + size / 2, y + size / 2);
  ctx.fillStyle = '#3e2723';
  ctx.fillRect(-size / 6, 0, size / 3, size / 2);
  ['#1b5e20', '#2e7d32', '#388e3c', '#43a047'].forEach((color, i) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(Math.sin(i * 1.5) * size / 3, -size / 3 + Math.cos(i * 2) * size / 4, size / 2.6 + (seed % 5), 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();
};
