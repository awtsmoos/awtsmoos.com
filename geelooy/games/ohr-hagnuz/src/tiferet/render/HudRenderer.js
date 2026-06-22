/**
 * B"H
 * @module HudRenderer
 * @description Always-on RPG guidance HUD for story, gifts, skills, Musagim, and declaration.
 *
 * Chapter 304: The player no longer wanders in holy fog. The Awtsmoos creates
 * the world from nothing every instant, and this screen now answers every
 * instant: where am I, what act is this, what must be restored, which gifts are
 * still misplaced, and whether the declaration is truth or premature noise.
 */
import { State } from '../../binah/State.js';

const C = { glass: 'rgba(5,8,18,.84)', deep: 'rgba(2,4,10,.92)', line: 'rgba(255,241,140,.55)', gold: '#ffd966', cyan: '#79e6ff', green: '#c7f59a', violet: '#e6c6ff', red: '#ff9b9b', white: '#f8fbff' };
const now = () => performance.now() * 0.001;

const round = (ctx, x, y, w, h, r = 10) => {
  ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.fill(); ctx.stroke();
};

const withBox = (ctx, x, y, w, h, r, fill = C.glass) => {
  ctx.fillStyle = fill; ctx.strokeStyle = C.line; ctx.lineWidth = 1; round(ctx, x, y, w, h, r);
};

const chip = (ctx, x, y, text, color, glow = false) => {
  const w = Math.min(ctx.canvas.width * 0.3, Math.max(58, ctx.measureText(text).width + 20));
  ctx.save(); ctx.shadowColor = glow ? color : 'transparent'; ctx.shadowBlur = glow ? 10 : 0;
  withBox(ctx, x, y, w, 28, 8); ctx.fillStyle = color; ctx.fillText(text, x + 9, y + 7); ctx.restore();
  return w + 6;
};

export const drawHud = ctx => {
  const time = now();
  ctx.save(); ctx.textBaseline = 'top'; ctx.font = '800 13px Inter, system-ui, sans-serif';
  drawTopChips(ctx); drawActRibbon(ctx, time); drawObjectivePanel(ctx); drawRightTracker(ctx); drawMessage(ctx, time);
  ctx.restore();
};

const drawTopChips = ctx => {
  let x = 10;
  x += chip(ctx, x, 10, `☀ ${State.Stats.light}`, C.gold, State.Stats.light < 35);
  x += chip(ctx, x, 10, `✦ ${State.Stats.sparks}`, C.cyan);
  x += chip(ctx, x, 10, `Lv ${State.Stats.level}`, C.green);
  chip(ctx, x, 10, (State.MapId || '').replace(/_/g, ' '), C.violet);
};

const drawActRibbon = (ctx, time) => {
  const story = State.Story || {};
  const label = `Act ${story.act || story.chapter || 1}: ${story.active || 'Village of Beginnings'}`;
  const w = Math.min(ctx.canvas.width - 84, Math.max(230, ctx.measureText(label).width + 38));
  const x = (ctx.canvas.width - w) / 2;
  ctx.save(); ctx.globalAlpha = 0.9; ctx.shadowColor = '#fff176'; ctx.shadowBlur = 5 + Math.sin(time * 4) * 2;
  withBox(ctx, x, 45, w, 30, 10, 'rgba(8,10,24,.84)'); ctx.shadowBlur = 0;
  ctx.fillStyle = C.gold; ctx.font = '850 13px Inter, system-ui, sans-serif'; ctx.textAlign = 'center';
  ctx.fillText(label, ctx.canvas.width / 2, 53); ctx.restore();
};

const drawObjectivePanel = ctx => {
  const story = State.Story || {};
  const x = 10, y = 84, w = Math.min(284, ctx.canvas.width - 20);
  const lines = [
    `Region: ${story.region || State.MapId || 'Unknown'}`,
    `Goal: ${story.objective || 'Find the next restoration.'}`,
    `Next: ${story.nextStep || 'Open Journal.'}`
  ].flatMap(line => wrapText(ctx, line, w - 18, 2));
  const h = 18 + lines.length * 14;
  ctx.save(); ctx.font = '750 11px Inter, system-ui, sans-serif'; withBox(ctx, x, y, w, h, 12, C.deep);
  lines.forEach((line, i) => { ctx.fillStyle = i === 0 ? C.cyan : C.white; ctx.fillText(line, x + 9, y + 9 + i * 14); });
  ctx.restore();
};

const drawRightTracker = ctx => {
  const w = Math.min(174, ctx.canvas.width * 0.42);
  const x = ctx.canvas.width - w - 10;
  const y = 84;
  const gift = giftSummary();
  const decl = declarationSummary();
  const musag = State.MusagDex || {};
  const skill = bestSkill();
  const rows = [
    ['Gifts', gift, gift.done ? C.green : C.gold],
    ['Declaration', decl, decl.includes('ready') ? C.green : C.red],
    ['Musag', `${musag.sweetenedCount || 0}/${musag.seenCount || 0} sweetened`, C.cyan],
    ['Skill', skill, C.violet]
  ];
  ctx.save(); ctx.font = '800 11px Inter, system-ui, sans-serif'; withBox(ctx, x, y, w, 92, 12, C.deep);
  rows.forEach((row, i) => { const yy = y + 8 + i * 20; ctx.fillStyle = C.white; ctx.fillText(`${row[0]}:`, x + 8, yy); ctx.fillStyle = row[2]; ctx.fillText(String(row[1]), x + 68, yy); });
  ctx.restore();
};

const giftSummary = () => {
  const names = ['terumah', 'maaser_rishon', 'maaser_ani', 'maaser_sheni', 'bikkurim'];
  const given = State.Gifts?.given || {};
  const count = names.filter(id => (given[id] || 0) > 0).length;
  return { toString: () => `${count}/5 restored`, done: count >= 5 };
};

const declarationSummary = () => {
  const declaration = State.Gifts?.declaration || {};
  const unlocked = declaration.unlocked?.length || 0;
  return declaration.ready || unlocked >= (declaration.total || 6) ? 'ready' : `${unlocked}/${declaration.total || 6} lines`;
};

const bestSkill = () => {
  const entries = Object.values(State.Skills || {});
  if (!entries.length) return 'Learning 1';
  const top = entries.reduce((a, b) => ((b.level || 1) > (a.level || 1) ? b : a), entries[0]);
  return `${top.name} ${top.level || 1}`;
};

const drawMessage = (ctx, time) => {
  if (State.MessageTTL <= 0 || !State.Message) return;
  ctx.save(); ctx.font = '850 13px Inter, system-ui, sans-serif';
  const maxW = Math.min(ctx.canvas.width - 54, 390);
  const lines = wrapText(ctx, State.Message, maxW - 34, 3);
  const h = 28 + lines.length * 17;
  const x = (ctx.canvas.width - maxW) / 2;
  const y = Math.min(ctx.canvas.height - 246, Math.max(188, ctx.canvas.height * 0.62 + Math.sin(time * 3) * 2));
  ctx.shadowColor = '#ffd966'; ctx.shadowBlur = 8; withBox(ctx, x, y, maxW, h, 13, 'rgba(3,5,12,.9)'); ctx.shadowBlur = 0;
  ctx.fillStyle = C.gold; ctx.textAlign = 'center'; lines.forEach((line, i) => ctx.fillText(line, ctx.canvas.width / 2, y + 13 + i * 17));
  ctx.restore();
};

const wrapText = (ctx, text, maxW, maxLines) => {
  const words = String(text || '').split(/\s+/).filter(Boolean);
  const lines = []; let line = '';
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width <= maxW) line = next;
    else { if (line) lines.push(line); line = word; }
    if (lines.length === maxLines) break;
  }
  if (line && lines.length < maxLines) lines.push(line);
  if (words.length && lines.length === maxLines && words.join(' ').length > lines.join(' ').length) lines[maxLines - 1] = `${lines[maxLines - 1].slice(0, 44)}…`;
  return lines.length ? lines : [''];
};
