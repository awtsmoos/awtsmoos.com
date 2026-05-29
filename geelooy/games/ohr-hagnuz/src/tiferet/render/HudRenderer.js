/**
 * B"H
 * @module HudRenderer
 *
 * Chapter 11: The Crown Became A Whisper.
 * The Awtsmoos has no body and no form; the HUD therefore learns restraint.
 * Mobile players receive only the most important signals, while messages rise
 * briefly through the center of the screen instead of occupying permanent land.
 */
import { State } from '../../binah/State.js';

const badge = (ctx, x, text, color = '#fffde7') => {
  const w = ctx.measureText(text).width + 18;
  ctx.fillStyle = 'rgba(0,0,0,.68)';
  ctx.fillRect(x, 10, w, 28);
  ctx.strokeStyle = 'rgba(255,245,157,.3)';
  ctx.strokeRect(x, 10, w, 28);
  ctx.fillStyle = color;
  ctx.fillText(text, x + 9, 18);
  return w + 8;
};

const drawToast = ctx => {
  if (State.MessageTTL <= 0 || !State.Message) return;
  const text = State.Message.length > 42 ? `${State.Message.slice(0, 41)}…` : State.Message;
  const w = Math.min(460, ctx.measureText(text).width + 40);
  const x = (ctx.canvas.width - w) / 2;
  const y = ctx.canvas.height * 0.18;
  ctx.fillStyle = 'rgba(20,20,20,.88)';
  ctx.fillRect(x, y, w, 42);
  ctx.strokeStyle = '#ffe082';
  ctx.strokeRect(x, y, w, 42);
  ctx.fillStyle = '#ffe082';
  ctx.fillText(text, x + 16, y + 13);
 };

/**
 * Draws a compact mobile-first HUD.
 *
 * @param {CanvasRenderingContext2D} ctx - Overlay context.
 * @returns {void}
 */
export const drawHud = ctx => {
  ctx.save();
  ctx.font = 'bold 13px monospace';
  ctx.textBaseline = 'top';

  let x = 10;
  x += badge(ctx, x, `☀ ${State.Stats.light}`,'#fff176');
  x += badge(ctx, x, `✦ ${State.Stats.sparks}`,'#80deea');
  x += badge(ctx, x, `Lv ${State.Stats.level}`,'#c5e1a5');
  badge(ctx, x, State.MapId.replace(/_/g,' '),'#e1bee7');

  drawToast(ctx);
  ctx.restore();
};