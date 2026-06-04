/**
 * B"H
 * @module HudRenderer
 * @description Overworld HUD with wrapped loud mission messages.
 *
 * Chapter 182: The message box learned to breathe. The Awtsmoos has no body
 * and no form, yet a phone screen cannot hold an endless prophecy on one line.
 * Messages now wrap, stay inside the frame, and speak loudly without spilling
 * over the road, joystick, or NPCs.
 */
import { State } from '../../binah/State.js';

const C = { glass: 'rgba(5,8,18,.84)', line: 'rgba(255,241,140,.55)', gold: '#ffd966', cyan: '#79e6ff', green: '#c7f59a', violet: '#e6c6ff' };
const t = () => performance.now() * 0.001;

const round = (ctx, x, y, w, h, r = 10) => {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fill();
  ctx.stroke();
};

const chip = (ctx, x, y, text, color, glow = false) => {
  const w = Math.min(ctx.canvas.width * 0.32, Math.max(60, ctx.measureText(text).width + 24));
  ctx.save();
  ctx.shadowColor = glow ? color : 'transparent';
  ctx.shadowBlur = glow ? 10 : 0;
  ctx.fillStyle = C.glass;
  ctx.strokeStyle = C.line;
  ctx.lineWidth = 1;
  round(ctx, x, y, w, 34, 8);
  ctx.fillStyle = color;
  ctx.fillText(text, x + 10, y + 9);
  ctx.restore();
  return w + 7;
};

export const drawHud = ctx => {
  const time = t();
  ctx.font = '800 16px Inter, system-ui, sans-serif';
  ctx.textBaseline = 'top';
  let x = 12;
  x += chip(ctx, x, 12, `☀ ${State.Stats.light}`, C.gold, State.Stats.light < 35);
  x += chip(ctx, x, 12, `✦ ${State.Stats.sparks}`, C.cyan);
  x += chip(ctx, x, 12, `Lv ${State.Stats.level}`, C.green);
  chip(ctx, x, 12, State.MapId.replace(/_/g, ' '), C.violet);
  drawActRibbon(ctx, time);
  drawMessage(ctx, time);
};

const drawActRibbon = (ctx, time) => {
  const label = `Act ${State.Story?.chapter || 1}: ${State.Story?.active || 'First Light'}`;
  const w = Math.min(ctx.canvas.width - 92, Math.max(210, ctx.measureText(label).width + 38));
  const x = (ctx.canvas.width - w) / 2;
  const y = 54;
  ctx.save();
  ctx.globalAlpha = 0.86;
  ctx.shadowColor = '#fff176';
  ctx.shadowBlur = 6 + Math.sin(time * 4) * 3;
  ctx.fillStyle = 'rgba(8,10,24,.82)';
  ctx.strokeStyle = 'rgba(255,241,118,.42)';
  round(ctx, x, y, w, 32, 10);
  ctx.shadowBlur = 0;
  ctx.fillStyle = C.gold;
  ctx.font = '850 13px Inter, system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(label, ctx.canvas.width / 2, y + 8);
  ctx.restore();
};

const drawMessage = (ctx, time) => {
  if (State.MessageTTL <= 0 || !State.Message) return;
  ctx.save();
  ctx.font = '850 13px Inter, system-ui, sans-serif';
  const maxW = Math.min(ctx.canvas.width - 54, 390);
  const lines = wrapText(ctx, State.Message, maxW - 34, 3);
  const h = 28 + lines.length * 17;
  const w = maxW;
  const x = (ctx.canvas.width - w) / 2;
  const y = Math.min(ctx.canvas.height - 246, Math.max(104, ctx.canvas.height * 0.63 + Math.sin(time * 3) * 2));
  ctx.shadowColor = '#ffd966';
  ctx.shadowBlur = 8;
  ctx.fillStyle = 'rgba(3,5,12,.88)';
  ctx.strokeStyle = C.line;
  round(ctx, x, y, w, h, 13);
  ctx.shadowBlur = 0;
  ctx.fillStyle = C.gold;
  ctx.textAlign = 'center';
  lines.forEach((line, i) => ctx.fillText(line, ctx.canvas.width / 2, y + 13 + i * 17));
  ctx.restore();
};

const wrapText = (ctx, text, maxW, maxLines) => {
  const words = String(text || '').split(/\s+/).filter(Boolean);
  const lines = [];
  let line = '';
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width <= maxW) line = next;
    else { lines.push(line); line = word; }
    if (lines.length === maxLines) break;
  }
  if (line && lines.length < maxLines) lines.push(line);
  if (words.length && lines.length === maxLines && words.join(' ').length > lines.join(' ').length) lines[maxLines - 1] = `${lines[maxLines - 1].slice(0, 42)}…`;
  return lines.length ? lines : [''];
};
