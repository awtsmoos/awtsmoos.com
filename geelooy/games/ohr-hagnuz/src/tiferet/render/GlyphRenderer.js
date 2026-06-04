/**
 * B"H
 * @module GlyphRenderer
 * @description Animated glyph dispatch with non-covering NPC guide markers.
 *
 * Chapter 181: The badge stopped sitting on the face. The Awtsmoos has no body
 * and no form, yet a label must guide without becoming a mask. NPC markers now
 * hover high and small; merchants/guides glow softly while their bodies remain
 * visible and approachable.
 */
import { Human } from './Human.js';
import { Architecture } from './Architecture.js';
import { drawNatureObject, drawTree } from './world/NatureRenderer.js';
import { drawMitzvah, drawMusag, drawObject, drawSynagogue } from './world/ObjectRenderer.js';

const time = () => performance.now() * 0.001;

const DRAWERS = {
  wall: (ctx, item, size) => Architecture.draw(ctx, item.x, item.y, size, item.rx, item.ry),
  tree: (ctx, item, size) => drawTree(ctx, item.x, item.y, size, item.seed),
  door: (ctx, item, size) => drawDoorAlive(ctx, item.x, item.y, size, item.seed),
  npc: (ctx, item, size) => drawNpc(ctx, item.x, item.y, size, item.glyph, item.seed, item.meta),
  musag: (ctx, item, size) => drawMusag(ctx, item.x, item.y, size, item.glyph, item.seed),
  object: (ctx, item, size) => drawObject(ctx, item.x, item.y, size, item.glyph),
  synagogue: (ctx, item, size) => drawSynagogue(ctx, item.x, item.y, size),
  mitzvah: (ctx, item, size) => drawMitzvah(ctx, item.x, item.y, size),
  nature: (ctx, item, size) => drawNatureObject(ctx, item.x, item.y, size, item.glyph, item.seed)
};

export const drawGlyphObject = (ctx, item, size) => {
  const drawer = DRAWERS[item.meta.kind] || DRAWERS.object;
  drawer(ctx, item, size);
};

export const drawNpc = (ctx, x, y, size, glyph, seed = 1, meta = {}) => {
  const t = time() + seed * 0.13;
  const progress = ((seed % 31) + t * 0.55) % 1;
  drawGuideBeam(ctx, x, y, size, t, meta);
  Human.draw(ctx, x, y + Math.sin(t * 3) * 1.5, size, progress, 'd');
  drawNpcBadge(ctx, x, y, size, glyph, t, meta);
};

const drawDoorAlive = (ctx, x, y, size, seed = 1) => {
  const t = time() + seed;
  Architecture.drawDoor(ctx, x, y, size);
  ctx.save();
  ctx.globalAlpha = 0.25 + Math.sin(t * 4) * 0.1;
  ctx.strokeStyle = '#fff176';
  ctx.lineWidth = 2;
  ctx.strokeRect(x + size * 0.22, y + size * 0.14, size * 0.56, size * 0.72);
  ctx.restore();
};

const drawGuideBeam = (ctx, x, y, size, t, meta) => {
  const cx = x + size * 0.5;
  const cy = y + size * 0.22 + Math.sin(t * 4) * 2;
  const color = meta.shop ? 'rgba(128,216,255,.26)' : 'rgba(255,241,118,.24)';
  const g = ctx.createRadialGradient(cx, cy, 2, cx, cy, size * 0.45);
  g.addColorStop(0, color);
  g.addColorStop(1, 'rgba(255,241,118,0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(cx, cy, size * 0.45, 0, Math.PI * 2);
  ctx.fill();
};

const drawNpcBadge = (ctx, x, y, size, glyph, t, meta) => {
  const cx = x + size * 0.5;
  const cy = y - size * 0.18 + Math.sin(t * 5) * 1.5;
  const bw = size * 0.34;
  const bh = size * 0.22;
  ctx.save();
  ctx.shadowColor = meta.shop ? '#80d8ff' : '#fff176';
  ctx.shadowBlur = 8;
  ctx.fillStyle = 'rgba(5,7,18,.88)';
  ctx.strokeStyle = meta.shop ? '#80d8ff' : '#fff176';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(cx - bw / 2, cy - bh / 2, bw, bh, 7);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#fffde7';
  ctx.font = `900 ${Math.round(size * 0.18)}px Georgia,serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(meta.shop ? '₪' : glyph, cx, cy);
  ctx.restore();
};
