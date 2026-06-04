/**
 * B"H
 * @module BattleRenderer
 * @description Main battle compositor with phase banners and reward stage.
 *
 * Chapter 202: The battle screen learned suspense. The Awtsmoos has no body and
 * no form, yet the player needs to see time pass: a banner announces the move,
 * effects land, the opponent answers, and rewards float before returning to the
 * overworld.
 */
import { State } from '../../binah/State.js';
import { resolveStats } from '../../yesod/equipment/EquipmentRuntime.js';
import { battleShake, drawBattleEffects } from './BattleEffects.js';
import { battleMoveLayout } from './BattleMoveLayout.js';
import { BATTLE_THEME as T } from './battle/BattleTheme.js';
import { drawStatCard, roundRect } from './battle/BattleCards.js';
import { drawBattleStage } from './battle/BattleStage.js';
import { drawCombatantShowcase } from './battle/BattleCombatants.js';
import { drawMoveCard, drawMovePrompt } from './battle/BattleMoveCards.js';

const enemyName = () => State.Debate.enemy?.name || 'Wild Musag';
const canvasSize = ctx => ({ w: ctx.canvas?.width || 390, h: ctx.canvas?.height || 844 });
const fit = (value = '', max = 72) => value.length > max ? `${value.slice(0, max - 1)}…` : value;
const isBusy = () => State.Debate.phase && State.Debate.phase !== 'choice';
const playerCard = (layout, stats) => ({ rect: layout.playerCard, title: 'Ohr Chozer', level: State.Stats.level, light: State.Stats.light, maxLight: State.Stats.maxLight, fill: T.colors.green, sub: `${State.Stats.sparks} sparks • ${State.Inventory.money || 0} zuz • ${stats.garment?.name || 'garment'}` });
const enemyCard = layout => ({ rect: layout.enemyCard, title: enemyName(), level: State.Debate.enemy?.level || State.Stats.level, light: State.Debate.enemyLight, maxLight: State.Debate.enemyMaxLight, fill: T.colors.red, sub: State.Debate.enemy?.kind || 'Wild Musag' });

export const renderBattle = ctx => {
  const stats = resolveStats();
  const size = canvasSize(ctx);
  const layout = battleMoveLayout(size.w, size.h);
  ctx.save();
  const shake = battleShake();
  ctx.translate(shake.x, shake.y);
  drawBattleStage(ctx, layout);
  drawBattleEffects(ctx, 'back');
  drawStatCard(ctx, playerCard(layout, stats));
  drawStatCard(ctx, enemyCard(layout));
  drawCombatantShowcase(ctx, layout, stats, State.Debate.enemy);
  drawBattleEffects(ctx, 'front');
  drawLastLog(ctx, layout);
  drawPhaseBanner(ctx, layout);
  ctx.restore();
  drawMoves(ctx, layout);
  drawFooterHints(ctx, layout);
  drawStageMeter(ctx, layout);
};

const drawMoves = (ctx, layout) => {
  if (isBusy()) return drawBusyPrompt(ctx, layout);
  ctx.save();
  drawMovePrompt(ctx, layout.prompt);
  State.Debate.moves.forEach((move, i) => drawMoveCard(ctx, move, layout.rects[i], i === State.Debate.cursor));
  ctx.restore();
};

const drawBusyPrompt = (ctx, layout) => {
  ctx.save();
  const rect = layout.prompt;
  ctx.fillStyle = 'rgba(5,7,18,.9)';
  ctx.strokeStyle = 'rgba(255,241,118,.55)';
  ctx.lineWidth = 1.5;
  roundRect(ctx, rect.x, rect.y, rect.w, rect.h + 16, 14);
  ctx.fillStyle = '#ffe082';
  ctx.font = `900 18px ${T.fonts.ui}`;
  ctx.textAlign = 'center';
  const title = State.Debate.phase === 'reward' ? 'Rewards entering Bag' : 'The sugya is moving...';
  ctx.fillText(title, rect.x + rect.w / 2, rect.y + 22);
  ctx.font = `800 12px ${T.fonts.ui}`;
  ctx.fillStyle = '#fffde7';
  ctx.fillText(State.Debate.banner || 'Wait for the next beat', rect.x + rect.w / 2, rect.y + 44);
  ctx.restore();
};

const drawLastLog = (ctx, layout) => {
  const line = State.Debate.log?.[0];
  if (!line) return;
  const rect = { x: layout.margin * 1.4, y: layout.stage.y + layout.stage.h - 38, w: layout.w - layout.margin * 2.8, h: 30 };
  ctx.save();
  ctx.fillStyle = 'rgba(5,7,18,.82)';
  ctx.strokeStyle = 'rgba(255,241,118,.46)';
  ctx.lineWidth = 1;
  roundRect(ctx, rect.x, rect.y, rect.w, rect.h, 10);
  ctx.fillStyle = '#fffde7';
  ctx.font = `800 11px ${T.fonts.ui}`;
  ctx.textAlign = 'center';
  ctx.fillText(fit(line, 64), rect.x + rect.w / 2, rect.y + 19);
  ctx.restore();
};

const drawPhaseBanner = (ctx, layout) => {
  if (!isBusy()) return;
  const text = State.Debate.phase === 'reward' ? State.Debate.rewardText : State.Debate.banner;
  if (!text) return;
  const w = Math.min(layout.w - 50, 330);
  const x = (layout.w - w) / 2;
  const y = layout.stage.y + 112;
  ctx.save();
  ctx.fillStyle = 'rgba(6,8,18,.86)';
  ctx.strokeStyle = State.Debate.phase === 'reward' ? '#ffd966' : '#80d8ff';
  ctx.shadowColor = ctx.strokeStyle;
  ctx.shadowBlur = 14;
  roundRect(ctx, x, y, w, 50, 16);
  ctx.shadowBlur = 0;
  ctx.fillStyle = State.Debate.phase === 'reward' ? '#ffd966' : '#fffde7';
  ctx.font = `900 14px ${T.fonts.ui}`;
  ctx.textAlign = 'center';
  ctx.fillText(fit(text, 44), layout.w / 2, y + 19);
  ctx.restore();
};

const drawStageMeter = (ctx, layout) => {
  const choice = State.Debate.choice?.stage || 'category';
  const steps = ['category', 'route', 'chapter', 'quote'];
  const active = steps.indexOf(choice);
  const y = layout.prompt.y - 10;
  ctx.save();
  steps.forEach((step, i) => {
    const x = layout.margin + 14 + i * 42;
    ctx.fillStyle = i <= active ? '#fff176' : 'rgba(255,255,255,.22)';
    ctx.beginPath(); ctx.arc(x, y, i === active ? 5 : 3.5, 0, Math.PI * 2); ctx.fill();
    if (i < steps.length - 1) { ctx.strokeStyle = i < active ? '#fff176' : 'rgba(255,255,255,.18)'; ctx.beginPath(); ctx.moveTo(x + 8, y); ctx.lineTo(x + 34, y); ctx.stroke(); }
  });
  ctx.restore();
};

const drawFooterHints = (ctx, layout) => {
  ctx.save();
  ctx.fillStyle = T.colors.muted;
  ctx.font = `800 11px ${T.fonts.ui}`;
  ctx.textAlign = 'center';
  ctx.globalAlpha = .72;
  ctx.fillText(isBusy() ? 'Wait...' : 'B: Back / Flee', layout.margin + 48, layout.footer.y + layout.footer.h * .55);
  ctx.fillText(isBusy() ? 'Reward goes to Bag' : 'A: Choose', layout.w - layout.margin - 56, layout.footer.y + layout.footer.h * .55);
  ctx.restore();
};
