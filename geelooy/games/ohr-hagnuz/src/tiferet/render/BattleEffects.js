/**
 * B"H
 * @module BattleEffects
 */
import { State } from '../../binah/State.js';

const letters = ['א','ב','ג','ד','ה','ו','ז','ח','ט','י','כ','ל','ם','נ','ס','ע','פ','צ','ק','ר','ש','ת'];

export const pushBattleEffect = (kind, target = 'enemy', text = '') => {
  State.BattleFx ||= [];
  const baseX = target === 'player' ? 210 : 590;
  const baseY = target === 'player' ? 330 : 190;
  for (let i = 0; i < 14; i++) {
    State.BattleFx.push({
      kind,
      text,
      glyph: letters[(Math.random() * letters.length) | 0],
      x: baseX + Math.random() * 80 - 40,
      y: baseY + Math.random() * 50 - 25,
      vx: (Math.random() - .5) * 5,
      vy: -2 - Math.random() * 4,
      life: 36 + Math.random() * 18,
      age: 0,
      size: 20 + Math.random() * 22
    });
  }
};

export const drawBattleEffects = (ctx) => {
  State.BattleFx ||= [];
  ctx.save();
  State.BattleFx.forEach(fx => {
    const t = fx.age / fx.life;
    ctx.globalAlpha = Math.max(0, 1 - t);
    ctx.font = `bold ${Math.floor(fx.size * (1 + t * .8))}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = fx.kind === 'heal' ? '#b9f6ca' : fx.kind === 'shield' ? '#80d8ff' : '#fff176';
    ctx.fillText(fx.glyph, fx.x, fx.y);
    fx.x += fx.vx;
    fx.y += fx.vy;
    fx.vy += .12;
    fx.age += 1;
  });
  State.BattleFx = State.BattleFx.filter(fx => fx.age < fx.life);
  ctx.restore();
};
