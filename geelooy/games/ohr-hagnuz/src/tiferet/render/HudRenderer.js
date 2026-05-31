/**
 * B"H
 * @module HudRenderer
 *
 * Chapter 59: The message rose above the thumb gates.
 * The Awtsmoos has no body and no form; this overlay keeps stat gems high and
 * pushes speech above controls so the player can see, walk, and tap cleanly.
 */
import { State } from '../../binah/State.js';

const COLORS = {
  glass: 'rgba(5,8,18,.72)', line: 'rgba(255,241,140,.52)', text: '#fff9df',
  gold: '#ffd966', cyan: '#79e6ff', green: '#c7f59a', violet: '#e6c6ff'
};

const round = (ctx, x, y, w, h, r = 10) => {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fill();
  ctx.stroke();
};

const chip = (ctx, x, y, text, color) => {
  const w = Math.min(ctx.canvas.width * .34, ctx.measureText(text).width + 28);
  ctx.fillStyle = COLORS.glass;
  ctx.strokeStyle = COLORS.line;
  ctx.lineWidth = 1;
  round(ctx, x, y, w, 34, 8);
  ctx.fillStyle = color;
  ctx.fillText(text, x + 12, y + 9);
  return w + 7;
};

const drawTopRibbon = ctx => {
  ctx.font = '800 16px Inter, system-ui, sans-serif';
  ctx.textBaseline = 'top';
  let x = 12;
  const y = 12;
  x += chip(ctx, x, y, `☀ ${State.Stats.light}`, COLORS.gold);
  x += chip(ctx, x, y, `✦ ${State.Stats.sparks}`, COLORS.cyan);
  x += chip(ctx, x, y, `Lv ${State.Stats.level}`, COLORS.green);
  chip(ctx, x, y, State.MapId.replace(/_/g, ' '), COLORS.violet);
};

const drawQuestToast = ctx => {
  if (State.MessageTTL <= 0 || !State.Message) return;
  const text = State.Message.length > 52 ? `${State.Message.slice(0, 51)}…` : State.Message;
  const w = Math.min(ctx.canvas.width - 36, Math.max(250, ctx.measureText(text).width + 44));
  const h = 46;
  const x = (ctx.canvas.width - w) / 2;
  const y = Math.max(110, ctx.canvas.height - 205);
  ctx.fillStyle = 'rgba(3,5,12,.82)';
  ctx.strokeStyle = COLORS.line;
  ctx.lineWidth = 1.2;
  round(ctx, x, y, w, h, 12);
  ctx.fillStyle = COLORS.gold;
  ctx.font = '800 14px Inter, system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(text, x + w / 2, y + 14);
  ctx.textAlign = 'left';
};

export const drawHud = ctx => {
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,.42)';
  ctx.shadowBlur = 10;
  drawTopRibbon(ctx);
  drawQuestToast(ctx);
  ctx.restore();
};
