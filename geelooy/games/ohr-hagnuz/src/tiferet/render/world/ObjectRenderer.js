/**
 * B"H
 * @module ObjectRenderer
 *
 * Chapter 44: Small interactables received dignity and glow.
 * The Awtsmoos has no body and no form; signs, mitzvah sparks, musag rings,
 * and sacred buildings become readable generated props with warm outlines.
 */
import { WORLD_COLORS as C } from './WorldPalette.js';
import { glow, pixel } from './WorldPrimitives.js';

export const drawMusag = (ctx, x, y, size, glyph, seed = 1) => {
  ctx.save();
  const cx = x + size / 2;
  const cy = y + size / 2;
  glow(ctx, cx, cy, size * .65, 'rgba(142,92,244,.36)');
  ctx.strokeStyle = '#caa8ff';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(cx, cy, size * .34 + (seed % 3), 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = 'rgba(72,44,120,.88)';
  ctx.beginPath();
  ctx.arc(cx, cy, size * .27, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fffde7';
  ctx.font = `800 ${Math.round(size * .34)}px Georgia,serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(glyph, cx, cy + 1);
  ctx.restore();
};

export const drawObject = (ctx, x, y, size, glyph) => {
  ctx.save();
  pixel(ctx, x + size * .18, y + size * .45, size * .64, size * .12, '#5b351f');
  pixel(ctx, x + size * .26, y + size * .2, size * .48, size * .36, '#8b5a2b');
  pixel(ctx, x + size * .3, y + size * .25, size * .4, size * .06, C.gold);
  ctx.strokeStyle = '#3a2219';
  ctx.strokeRect(x + size * .26, y + size * .2, size * .48, size * .36);
  ctx.fillStyle = '#fff8d1';
  ctx.font = `800 ${Math.round(size * .24)}px Georgia,serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(glyph, x + size / 2, y + size * .39);
  ctx.restore();
};

export const drawSynagogue = (ctx, x, y, size) => {
  ctx.save();
  pixel(ctx, x + size * .1, y + size * .28, size * .8, size * .62, '#bda996');
  pixel(ctx, x + size * .18, y + size * .38, size * .64, size * .5, C.stone);
  ctx.fillStyle = C.roof;
  ctx.beginPath();
  ctx.moveTo(x + size * .05, y + size * .3);
  ctx.lineTo(x + size * .5, y + size * .04);
  ctx.lineTo(x + size * .95, y + size * .3);
  ctx.fill();
  glow(ctx, x + size * .5, y + size * .6, size * .32, 'rgba(50,170,255,.32)');
  ctx.fillStyle = '#e8f6ff';
  ctx.font = `800 ${Math.round(size * .34)}px Georgia,serif`;
  ctx.textAlign = 'center';
  ctx.fillText('✡', x + size / 2, y + size * .68);
  ctx.restore();
};

export const drawMitzvah = (ctx, x, y, size) => {
  ctx.save();
  glow(ctx, x + size / 2, y + size / 2, size * .6, 'rgba(79,195,247,.42)');
  ctx.strokeStyle = '#80d8ff';
  ctx.lineWidth = 2;
  ctx.strokeRect(x + size * .18, y + size * .18, size * .64, size * .64);
  ctx.fillStyle = 'rgba(10,74,120,.72)';
  ctx.fillRect(x + size * .24, y + size * .24, size * .52, size * .52);
  ctx.fillStyle = '#fff';
  ctx.font = `800 ${Math.round(size * .3)}px Georgia,serif`;
  ctx.textAlign = 'center';
  ctx.fillText('✡', x + size / 2, y + size * .6);
  ctx.restore();
};
