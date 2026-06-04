/**
 * B"H
 * @module BattleEffects
 * @description Loud, layered, reward-aware battle feedback.
 *
 * Chapter 201: The sparks learned choreography. The Awtsmoos has no body and
 * no form, yet the finite eye needs ceremony: warning rings, impact beams,
 * reward coins, letters, and front text that lands without burying the fighters.
 */
import { State } from '../../binah/State.js';

const LETTERS = ['א','ב','ג','ד','ה','ו','ז','ח','ט','י','כ','ל','ם','נ','ס','ע','פ','צ','ק','ר','ש','ת'];
const COINS = ['✦','₪','◈','◆'];
const rand = (min, max) => min + Math.random() * (max - min);
const pick = list => list[(Math.random() * list.length) | 0];
const colorOf = kind => kind.includes('reward') ? '#ffd966' : kind.includes('heal') ? '#9dffb1' : kind.includes('shield') ? '#80d8ff' : kind.includes('enemy') ? '#ff5b5b' : '#fff176';

export const pushBattleEffect = (kind, target = 'enemy', text = '') => {
  State.BattleFx ||= [];
  State.Debate.fxShake = Math.max(State.Debate.fxShake || 0, kind === 'hit' ? 16 : 9);
  spawnBeam(kind, target, text);
  spawnBurst(kind, target, text);
  spawnText(kind, target, text);
};

export const pushRewardEffect = text => {
  State.BattleFx ||= [];
  State.Debate.fxShake = Math.max(State.Debate.fxShake || 0, 12);
  for (let i = 0; i < 26; i += 1) {
    State.BattleFx.push({ kind: 'reward', target: 'center', text, glyph: pick(COINS), age: 0, life: rand(44, 72), layer: 'front', ox: rand(-0.28, 0.28), oy: rand(-0.05, 0.14), vx: rand(-1.4, 1.4), vy: rand(-4.5, -1.2), spin: rand(-0.18, 0.18), size: rand(13, 24) });
  }
  State.BattleFx.push({ kind: 'reward-quote', target: 'center', text, age: 0, life: 78, size: 14, layer: 'front', ox: 0, oy: -0.17, vx: 0, vy: -0.12 });
};

export const effectAnchor = (ctx, target) => ({
  x: ctx.canvas.width * (target === 'player' ? 0.3 : target === 'center' ? 0.5 : 0.7),
  y: ctx.canvas.height * (target === 'player' ? 0.4 : target === 'center' ? 0.38 : 0.36)
});

export const battleShake = () => {
  const amp = Math.max(0, State.Debate?.fxShake || 0);
  if (State.Debate) State.Debate.fxShake = Math.max(0, amp - 1);
  return { x: rand(-amp, amp) * 0.24, y: rand(-amp, amp) * 0.18 };
};

export const drawBattleEffects = (ctx, layer = 'back') => {
  State.BattleFx ||= [];
  if (layer === 'back') drawAmbientRays(ctx);
  ctx.save();
  State.BattleFx.forEach(fx => { if ((fx.layer || 'back') === layer) drawFx(ctx, fx); });
  State.BattleFx = State.BattleFx.filter(fx => fx.age < fx.life);
  ctx.restore();
};

const spawnBeam = (kind, target, text) => {
  State.BattleFx.push({ kind: `${kind}-beam`, target, text, age: 0, life: 18, size: 1, layer: 'back' });
  State.BattleFx.push({ kind: `${kind}-ring`, target, text, age: 0, life: 34, size: 12, layer: 'back' });
};

const spawnBurst = (kind, target, text) => {
  for (let i = 0; i < 22; i += 1) {
    State.BattleFx.push({ kind, target, text, glyph: pick(LETTERS), age: 0, life: rand(28, 48), layer: 'back', ox: rand(-0.07, 0.07), oy: rand(-0.03, 0.05), vx: rand(-3.2, 3.2), vy: rand(-5.2, -1.2), spin: rand(-0.16, 0.16), size: rand(10, 22) });
  }
};

const spawnText = (kind, target, text) => {
  const words = String(text || '').split(/\s+/).filter(Boolean).slice(0, 4).join(' ');
  State.BattleFx.push({ kind: `${kind}-quote`, target, text: words || 'אור', age: 0, life: 36, size: 12, layer: 'front', ox: 0, oy: -0.23, vx: 0, vy: -0.45 });
};

const drawFx = (ctx, fx) => {
  const a = effectAnchor(ctx, fx.target);
  const t = fx.age / fx.life;
  const x = a.x + (fx.ox || 0) * ctx.canvas.width + (fx.vx || 0) * fx.age;
  const y = a.y + (fx.oy || 0) * ctx.canvas.height + (fx.vy || 0) * fx.age + fx.age * fx.age * 0.035;
  ctx.globalAlpha = Math.max(0, 0.9 - t * 0.9);
  if (fx.kind.includes('beam')) drawBeam(ctx, fx, a, t);
  else if (fx.kind.includes('ring')) drawRing(ctx, fx, a, t);
  else if (fx.kind.includes('quote')) drawQuote(ctx, fx, x, y, t);
  else drawLetter(ctx, fx, x, y, t);
  fx.age += 1;
};

const drawBeam = (ctx, fx, a, t) => {
  const from = effectAnchor(ctx, fx.target === 'player' ? 'enemy' : 'player');
  const color = colorOf(fx.kind);
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 8 * (1 - t) + 1;
  ctx.shadowColor = color;
  ctx.shadowBlur = 20;
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.quadraticCurveTo(ctx.canvas.width / 2, from.y - 62 - Math.sin(t * 10) * 22, a.x, a.y);
  ctx.stroke();
  ctx.restore();
};

const drawRing = (ctx, fx, a, t) => {
  const color = colorOf(fx.kind);
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 4 * (1 - t) + 1;
  ctx.shadowColor = color;
  ctx.shadowBlur = 18;
  ctx.beginPath();
  ctx.arc(a.x, a.y, fx.size + t * 64, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
};

const drawLetter = (ctx, fx, x, y, t) => {
  const color = colorOf(fx.kind);
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate((fx.spin || 0) * fx.age);
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = fx.kind === 'reward' ? 16 : 11;
  ctx.font = `900 ${Math.floor(fx.size * (1 + t * 0.25))}px Georgia,serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(fx.glyph, 0, 0);
  ctx.restore();
};

const drawQuote = (ctx, fx, x, y, t) => {
  ctx.save();
  ctx.globalAlpha = Math.max(0, 0.82 - t * 0.82);
  ctx.fillStyle = colorOf(fx.kind);
  ctx.strokeStyle = '#050714';
  ctx.lineWidth = 3;
  ctx.font = `900 ${Math.floor(fx.size + t * 4)}px Georgia,serif`;
  ctx.textAlign = 'center';
  ctx.strokeText(fx.text, x, y);
  ctx.fillText(fx.text, x, y);
  ctx.restore();
};

const drawAmbientRays = ctx => {
  const time = performance.now() * 0.002;
  ctx.save();
  ctx.globalAlpha = 0.14;
  for (let i = 0; i < 6; i += 1) {
    const y = ctx.canvas.height * (0.18 + i * 0.1) + Math.sin(time + i) * 12;
    const g = ctx.createLinearGradient(0, y, ctx.canvas.width, y + 26);
    g.addColorStop(0, 'rgba(255,241,118,0)');
    g.addColorStop(0.5, i % 2 ? 'rgba(128,216,255,.38)' : 'rgba(255,241,118,.38)');
    g.addColorStop(1, 'rgba(255,241,118,0)');
    ctx.fillStyle = g;
    ctx.fillRect(-20, y, ctx.canvas.width + 40, 4);
  }
  ctx.restore();
};
