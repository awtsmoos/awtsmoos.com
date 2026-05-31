/**
 * B"H
 * @module BattleCombatants
 *
 * Chapter 62: The duelists stopped being boxes and became silhouettes.
 * The Awtsmoos has no body and no form; still, the battle screen needs
 * readable beings: a side-facing hero with kippah, coat, hands, feet, breath,
 * and a shadow-Musag whose aura coils like a question waiting to be sweetened.
 */
import { BATTLE_THEME as T } from './BattleTheme.js';
import { drawAura } from './BattleStage.js';

const pulse = () => performance.now() / 500;
const wave = (speed = 1, amp = 1) => Math.sin(pulse() * speed) * amp;

export const drawCombatantShowcase = (ctx, layout, stats, enemy) => {
  drawHero(ctx, layout.player, stats);
  drawEnemy(ctx, layout.enemy, enemy);
};

const drawHero = (ctx, spot, stats) => {
  const bob = wave(1.1, 4);
  ctx.save();
  drawAura(ctx, spot.x, spot.y - spot.size * .18, spot.size * .95, T.glow.player);
  drawFloorShadow(ctx, spot.x, spot.y + spot.size * .29, spot.size * .46);
  ctx.translate(spot.x, spot.y + bob);
  ctx.scale(spot.size / 128, spot.size / 128);
  drawHeroLegs(ctx);
  drawHeroCoat(ctx, stats?.garment?.icon || '✦');
  drawHeroArms(ctx);
  drawHeroHead(ctx);
  ctx.restore();
};

const drawEnemy = (ctx, spot, enemy) => {
  const bob = wave(1.35, -5);
  ctx.save();
  drawAura(ctx, spot.x, spot.y - spot.size * .12, spot.size * 1.05, T.glow.enemy);
  drawEnemyRings(ctx, spot.x, spot.y, spot.size);
  drawFloorShadow(ctx, spot.x, spot.y + spot.size * .3, spot.size * .52);
  ctx.translate(spot.x, spot.y + bob);
  ctx.scale(spot.size / 132, spot.size / 132);
  drawVoidMusag(ctx, enemy?.glyph || '?');
  ctx.restore();
};

const drawFloorShadow = (ctx, x, y, r) => {
  ctx.fillStyle = 'rgba(0,0,0,.55)';
  ctx.beginPath();
  ctx.ellipse(x, y, r, r * .22, 0, 0, Math.PI * 2);
  ctx.fill();
};

const drawHeroHead = ctx => {
  ctx.fillStyle = '#f4c795';
  ctx.fillRect(-13, -79, 36, 39);
  ctx.fillStyle = '#ffd7a8';
  ctx.fillRect(-10, -77, 31, 33);
  ctx.fillStyle = '#11151c';
  ctx.fillRect(-15, -83, 41, 12);
  ctx.fillRect(-15, -72, 8, 15);
  ctx.fillStyle = '#05070d';
  ctx.beginPath();
  ctx.ellipse(4, -86, 14, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#3155ff';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.fillStyle = '#16202a';
  ctx.fillRect(1, -61, 5, 5);
  ctx.fillRect(17, -61, 4, 5);
  ctx.fillStyle = '#1b2028';
  ctx.fillRect(-2, -47, 20, 8);
};

const drawHeroCoat = (ctx, icon) => {
  const g = ctx.createLinearGradient(-27, -38, 29, 28);
  g.addColorStop(0, '#0b3767');
  g.addColorStop(.45, '#1b78bd');
  g.addColorStop(1, '#082345');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.roundRect(-26, -42, 54, 68, 8);
  ctx.fill();
  ctx.fillStyle = '#e8fbff';
  ctx.beginPath();
  ctx.moveTo(-9, -41);
  ctx.lineTo(1, -28);
  ctx.lineTo(13, -41);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.12)';
  ctx.fillRect(10, -33, 5, 50);
  ctx.fillStyle = '#dff8ff';
  ctx.font = '800 18px Georgia,serif';
  ctx.textAlign = 'center';
  ctx.fillText(icon, 2, -2);
};

const drawHeroArms = ctx => {
  ctx.fillStyle = '#08345f';
  ctx.fillRect(-38, -35, 13, 50);
  ctx.fillStyle = '#1a78bd';
  ctx.fillRect(27, -34, 12, 48);
  ctx.fillStyle = '#ffd7a8';
  ctx.fillRect(-38, 11, 13, 11);
  ctx.fillRect(27, 10, 12, 11);
};

const drawHeroLegs = ctx => {
  ctx.fillStyle = '#152435';
  ctx.fillRect(-19, 25, 14, 39);
  ctx.fillRect(8, 25, 14, 39);
  ctx.fillStyle = '#05070d';
  ctx.fillRect(-22, 62, 22, 7);
  ctx.fillRect(4, 62, 23, 7);
};

const drawVoidMusag = (ctx, glyph) => {
  const g = ctx.createLinearGradient(0, -85, 0, 58);
  g.addColorStop(0, '#171020');
  g.addColorStop(.7, '#100a18');
  g.addColorStop(1, '#090610');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(0, -54, 35, 34, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.roundRect(-34, -30, 68, 86, 26);
  ctx.fill();
  ctx.fillStyle = '#ffe86b';
  ctx.shadowColor = '#ffe86b';
  ctx.shadowBlur = 8;
  ctx.fillRect(-16, -61, 8, 8);
  ctx.fillRect(10, -61, 8, 8);
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#dcbcff';
  ctx.font = '900 26px Georgia,serif';
  ctx.textAlign = 'center';
  ctx.fillText(glyph, 0, 13);
  ctx.fillStyle = 'rgba(255,255,255,.06)';
  ctx.fillRect(-18, -20, 5, 57);
};

const drawEnemyRings = (ctx, x, y, size) => {
  ctx.save();
  ctx.globalAlpha = .52;
  ctx.strokeStyle = T.colors.purple;
  ctx.lineWidth = 3;
  const offset = wave(1.7, 10);
  for (let i = 0; i < 4; i += 1) {
    ctx.beginPath();
    ctx.arc(x + offset * .25, y - size * .16, size * (.33 + i * .1), -1.35, 1.35);
    ctx.stroke();
  }
  ctx.restore();
};
