/**
 * B"H
 * @module BattleCombatants
 * @description Animated combatant bodies, charge poses, wounds, and aura dirt.
 *
 * Chapter 160: The bodies learned to flinch. The Awtsmoos has no body and no
 * form, yet the screen needs vessels that breathe, lunge, recoil, glare, and
 * leak sparks. The hero sways with learned light; the musag mutates like a bad
 * thought losing its grip.
 */
import { BATTLE_THEME as T } from './BattleTheme.js';

const TAU = Math.PI * 2;
const now = () => performance.now() * 0.001;

/** @returns {void} */
export const drawCombatantShowcase = (ctx, layout, stats, enemy) => {
  const t = now();
  const heroSpot = anchor(layout.stage, 0.29, 0.72, layout.player.size);
  const enemySpot = anchor(layout.stage, 0.71, 0.67, layout.enemy.size);
  drawShadow(ctx, heroSpot, t, 'player');
  drawShadow(ctx, enemySpot, t, 'enemy');
  drawHero(ctx, heroSpot, stats, t);
  drawEnemy(ctx, enemySpot, enemy, t);
};

const anchor = (stage, ax, ay, fallbackSize) => ({
  x: stage.x + stage.w * ax,
  y: stage.y + stage.h * ay,
  size: Math.max(92, Math.min(fallbackSize || 140, stage.h * 0.5))
});

const drawShadow = (ctx, spot, t, side) => {
  ctx.save();
  const pulse = 1 + Math.sin(t * 5 + (side === 'enemy' ? 2 : 0)) * 0.08;
  ctx.fillStyle = 'rgba(0,0,0,.42)';
  ctx.beginPath();
  ctx.ellipse(spot.x, spot.y + spot.size * 0.34, spot.size * 0.33 * pulse, spot.size * 0.1, 0, 0, TAU);
  ctx.fill();
  ctx.restore();
};

const drawHero = (ctx, spot, stats, t) => {
  ctx.save();
  const bob = Math.sin(t * 4.3) * 4;
  ctx.translate(spot.x, spot.y + bob);
  ctx.rotate(Math.sin(t * 2.2) * 0.025);
  const s = spot.size / 118;
  ctx.scale(s, s);
  drawHeroAura(ctx, t);
  drawHeroLegs(ctx, t);
  drawHeroCoat(ctx, stats?.garment?.icon || '✦', t);
  drawHeroArms(ctx, t);
  drawHeroHead(ctx, t);
  drawHalo(ctx, t);
  ctx.restore();
};

const drawEnemy = (ctx, spot, enemy, t) => {
  ctx.save();
  const twitch = Math.sin(t * 11) * 3 + Math.sin(t * 19) * 1.5;
  ctx.translate(spot.x + twitch, spot.y + Math.sin(t * 3.7) * 6);
  ctx.rotate(Math.sin(t * 5.5) * 0.05);
  const size = spot.size;
  drawEnemyAura(ctx, size, t);
  drawEnemyBody(ctx, size, t);
  drawEnemyEyes(ctx, size, t);
  drawEnemyGlyph(ctx, size, enemy?.glyph || 'ס', t);
  drawEnemyClaws(ctx, size, t);
  ctx.restore();
};

const drawHeroAura = (ctx, t) => {
  const g = ctx.createRadialGradient(0, 0, 6, 0, 0, 88 + Math.sin(t * 5) * 8);
  g.addColorStop(0, 'rgba(128,216,255,.34)');
  g.addColorStop(1, 'rgba(128,216,255,0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(0, -6, 92, 0, TAU);
  ctx.fill();
};

const drawHeroLegs = (ctx, t) => {
  ctx.fillStyle = '#101723';
  ctx.fillRect(-18, 36, 12, 42 + Math.sin(t * 7) * 2);
  ctx.fillRect(7, 36, 12, 42 - Math.sin(t * 7) * 2);
  ctx.fillStyle = '#050507';
  ctx.fillRect(-20, 74, 19, 8);
  ctx.fillRect(5, 74, 19, 8);
};

const drawHeroCoat = (ctx, icon, t) => {
  ctx.fillStyle = '#092f6e';
  ctx.fillRect(-27, -22, 54, 63);
  ctx.fillStyle = '#1976ba';
  ctx.fillRect(-18, -20, 28, 58);
  ctx.fillStyle = '#dff7ff';
  ctx.font = `900 ${18 + Math.sin(t * 6) * 2}px ${T.fonts.display}`;
  ctx.textAlign = 'center';
  ctx.fillText(icon, 0, 8);
};

const drawHeroArms = (ctx, t) => {
  ctx.fillStyle = '#0b3b79';
  ctx.save();
  ctx.rotate(-0.12 + Math.sin(t * 5) * 0.05);
  ctx.fillRect(-41, -15, 14, 43);
  ctx.restore();
  ctx.save();
  ctx.rotate(0.2 + Math.sin(t * 6) * 0.06);
  ctx.fillRect(25, -16, 14, 43);
  ctx.restore();
  ctx.fillStyle = '#ffd9ad';
  ctx.fillRect(-40, 27, 15, 14);
  ctx.fillRect(24, 27, 15, 14);
};

const drawHeroHead = (ctx, t) => {
  ctx.fillStyle = '#ffd9ad';
  ctx.fillRect(-18, -56, 36, 33);
  ctx.fillStyle = '#07080c';
  ctx.fillRect(-22, -67, 44, 14);
  ctx.fillRect(13, -64, 11, 44);
  ctx.fillStyle = '#111';
  ctx.fillRect(-10, -43, 5, 5);
  ctx.fillRect(8, -43, 5, 5);
  ctx.fillRect(-6, -31 + Math.sin(t * 4), 18, 5);
};

const drawHalo = (ctx, t) => {
  ctx.strokeStyle = '#fff176';
  ctx.lineWidth = 5;
  ctx.strokeRect(-26, -81 + Math.sin(t * 3) * 2, 52, 9);
  ctx.strokeStyle = '#111';
  ctx.lineWidth = 2;
  ctx.strokeRect(-27, -82 + Math.sin(t * 3) * 2, 54, 11);
};

const drawEnemyAura = (ctx, size, t) => {
  const r = size * (0.56 + Math.sin(t * 9) * 0.04);
  const aura = ctx.createRadialGradient(0, -size * 0.14, size * 0.04, 0, 0, r);
  aura.addColorStop(0, 'rgba(255,82,82,.32)');
  aura.addColorStop(0.45, 'rgba(202,168,255,.25)');
  aura.addColorStop(1, 'rgba(202,168,255,0)');
  ctx.fillStyle = aura;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, TAU);
  ctx.fill();
};

const drawEnemyBody = (ctx, size, t) => {
  ctx.fillStyle = '#090511';
  blob(ctx, 0, -size * 0.16, size * 0.3, size * 0.27, t);
  ctx.fillStyle = '#140620';
  blob(ctx, 0, size * 0.08, size * 0.28, size * 0.34, t + 2);
};

const blob = (ctx, x, y, rx, ry, t) => {
  ctx.beginPath();
  for (let i = 0; i < 12; i += 1) {
    const a = i / 12 * TAU;
    const wob = 1 + Math.sin(t * 5 + i) * 0.12;
    const px = x + Math.cos(a) * rx * wob;
    const py = y + Math.sin(a) * ry * wob;
    if (!i) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
};

const drawEnemyEyes = (ctx, size, t) => {
  ctx.fillStyle = '#fff176';
  const blink = Math.max(2, size * 0.08 * (0.8 + Math.sin(t * 8) * 0.2));
  ctx.fillRect(-size * 0.13, -size * 0.28, size * 0.09, blink);
  ctx.fillRect(size * 0.05, -size * 0.28, size * 0.09, blink);
};

const drawEnemyGlyph = (ctx, size, glyph, t) => {
  ctx.fillStyle = '#caa8ff';
  ctx.shadowColor = '#caa8ff';
  ctx.shadowBlur = 18;
  ctx.font = `900 ${Math.round(size * (0.23 + Math.sin(t * 4) * 0.015))}px ${T.fonts.display}`;
  ctx.textAlign = 'center';
  ctx.fillText(glyph, 0, size * 0.2);
  ctx.shadowBlur = 0;
};

const drawEnemyClaws = (ctx, size, t) => {
  ctx.strokeStyle = '#ff6b6b';
  ctx.lineWidth = 3;
  for (let side of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(side * size * 0.22, -size * 0.02);
    ctx.lineTo(side * size * (0.36 + Math.sin(t * 9) * 0.03), size * 0.12);
    ctx.lineTo(side * size * 0.25, size * 0.18);
    ctx.stroke();
  }
};
