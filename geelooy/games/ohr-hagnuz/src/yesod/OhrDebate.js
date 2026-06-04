/**
 * B"H
 * @module OhrDebate
 * @description Staged debate loop with Torah routes, wait timers, rewards, and bag drops.
 *
 * Chapter 200: The battle learned to breathe. The Awtsmoos has no body and no
 * form, yet finite drama needs beats: prepare, impact, pause, opponent reply,
 * reward. Every win now lands into the Bag with zuzim, consumables, sparks,
 * garments, journal notes, exp, and mission progress.
 */
import { State } from '../binah/State.js';
import { recordQuestEvent } from './OhrQuest.js';
import { addGarment, computeDebateDamage, computeDefenseLoss, computeHeal, garmentRewardForDebateMilestone, resolveStats, syncLightCapacity } from './equipment/EquipmentRuntime.js';
import { currentMoves, learnRouteFromMove } from './abilities/AbilityRuntime.js';
import { pushBattleEffect, pushRewardEffect } from '../tiferet/render/BattleEffects.js';
import { battleReward, resolveBattleRank, scaleEnemyLight } from './battle/BattleRank.js';
import { applyStatusFromMove, ensureBattleStatus, preEnemyReply, tickBattleStatus } from './battle/BattleStatus.js';
import { backChoice, battleOptions, chooseOption, choicePrompt, freshChoice } from './battle/TorahChoiceRuntime.js';
import { ensureSkills, grantBattleSkills } from './skills/SkillRuntime.js';
import { isMusag, recordMusag } from './musag/MusagDex.js';
import { recordQuoteUse } from './codex/TorahCodexRuntime.js';
import { addItem, addJournalNote, addMoney, ensureBag, rewardLine } from './bag/BagRuntime.js';

const PHASE = { intro: 32, impact: 32, enemy: 40, reward: 78, choice: 0 };
const setPhase = (phase, ttl = PHASE[phase] || 0, banner = '') => { State.Debate.phase = phase; State.Debate.phaseTTL = ttl; State.Debate.banner = banner; };
const busy = () => State.Debate.phase && State.Debate.phase !== 'choice';

export const startDebate = encounter => {
  ensureBag(); syncLightCapacity(); ensureSkills();
  const stats = resolveStats();
  const scaledLight = scaleEnemyLight(encounter);
  State.ActiveRealm = 'DEBATE';
  State.HeroPath = [];
  State.Debate.enemy = encounter;
  State.Debate.rank = resolveBattleRank(encounter);
  State.Debate.enemyLight = scaledLight;
  State.Debate.enemyMaxLight = scaledLight;
  State.Debate.cursor = 0;
  State.Debate.choice = freshChoice();
  State.Debate.moves = battleOptions(State.Debate.choice);
  State.Debate.lastMove = currentMoves()[0];
  State.Debate.status = { player: {}, enemy: {} };
  State.Debate.turn = 0;
  State.Debate.fxShake = 8;
  State.Debate.pendingEnemy = null;
  State.Debate.pendingReward = null;
  State.Debate.rewardText = '';
  ensureBattleStatus();
  State.BattleFx = [];
  pushBattleEffect('shield', 'player', stats.soulClass?.name || stats.garment?.name || 'garment');
  pushBattleEffect('enemy', 'enemy', encounter.name || 'musag');
  if (isMusag(encounter)) recordMusag(encounter, false);
  setPhase('intro', PHASE.intro, `${encounter.name} appears`);
  State.Debate.log = [`${State.Debate.rank.label}: ${encounter.lesson}`, `Weakness: ${encounter.weakTo || 'Any Torah'} • Element: ${encounter.element || 'Guide'}`, 'Pick category → route → chapter → quote. B backs up.'];
  State.say(`Debate: ${encounter.name}. ${choicePrompt(State.Debate.choice)}.`, 360);
};

export const selectDebateMove = index => {
  if (State.ActiveRealm !== 'DEBATE' || busy()) return false;
  selectBattleOption(index);
  return true;
};

export const debateTick = held => {
  tickPhase();
  const i = window.AwtsmoosIntents || {};
  if (busy()) return setHeld(held, i);
  if (i.U && !held.u) State.Debate.cursor = Math.max(0, State.Debate.cursor - 1);
  if (i.D && !held.d) State.Debate.cursor = Math.min(State.Debate.moves.length - 1, State.Debate.cursor + 1);
  if (i.B && !held.b) goBackOrFlee();
  if (i.A && !held.a) selectBattleOption(State.Debate.cursor);
  setHeld(held, i);
};

const setHeld = (held, i) => { held.u = i.U; held.d = i.D; held.a = i.A; held.b = i.B; };
export const useMove = index => selectBattleOption(index);

const tickPhase = () => {
  if (!busy()) return;
  State.Debate.phaseTTL -= 1;
  if (State.Debate.phaseTTL > 0) return;
  if (State.Debate.phase === 'impact') return resolveAfterImpact();
  if (State.Debate.phase === 'enemy') return finishEnemyReply();
  if (State.Debate.phase === 'reward') return finishRewardScreen();
  setPhase('choice', 0, '');
};

const selectBattleOption = index => {
  if (busy()) return;
  const picked = State.Debate.moves[index];
  const result = chooseOption(State.Debate.choice, index);
  State.Debate.choice = result.choice;
  State.Debate.cursor = 0;
  State.Debate.moves = battleOptions(State.Debate.choice);
  if (!result.move) return chargeChoice(picked);
  applyChosenQuote(result.move);
};

const chargeChoice = picked => {
  const label = picked?.name || choicePrompt(State.Debate.choice);
  State.Debate.log.unshift(`Opened vessel: ${label}.`);
  pushBattleEffect('shield', 'player', label);
  setPhase('intro', 12, label);
  State.say(choicePrompt(State.Debate.choice), 140);
};

const goBackOrFlee = () => {
  if (!State.Debate.choice || State.Debate.choice.stage === 'category') return endDebate(false, 'You withdrew from the debate.');
  State.Debate.choice = backChoice(State.Debate.choice);
  State.Debate.cursor = 0;
  State.Debate.moves = battleOptions(State.Debate.choice);
  pushBattleEffect('shield', 'player', 'back');
  setPhase('intro', 10, 'Back');
  State.say(choicePrompt(State.Debate.choice), 140);
};

const applyChosenQuote = move => {
  State.Debate.lastMove = move;
  const codex = recordQuoteUse(move);
  const result = computeDebateDamage(move, State.Debate.enemy);
  grantBattleSkills(move, State.Debate.enemy, false);
  State.Debate.enemyLight = Math.max(0, State.Debate.enemyLight - result.damage);
  pushBattleEffect('hit', 'enemy', move.routeQuote);
  applyStatusFromMove(move, result);
  if (move.heal) healWithMove(move);
  State.Debate.log.unshift(logLine(move, result, codex));
  setPhase('impact', PHASE.impact, `${move.category} lands for ${result.damage}`);
};

const resolveAfterImpact = () => {
  if (State.Debate.enemyLight <= 0) return endDebate(true, `${State.Debate.enemy.name} is sweetened.`);
  queueEnemyReply();
};

const queueEnemyReply = () => {
  const shield = computeDefenseLoss(preEnemyReply(5 + Math.floor(Math.random() * 10)));
  State.Debate.pendingEnemy = shield;
  pushBattleEffect('enemy', 'player', State.Debate.enemy?.name || 'challenge');
  setPhase('enemy', PHASE.enemy, `${State.Debate.enemy.name} answers`);
};

const finishEnemyReply = () => {
  const shield = State.Debate.pendingEnemy || { loss: 1, shield: 0 };
  State.Stats.light = Math.max(1, State.Stats.light - shield.loss);
  State.Debate.log.unshift(`${State.Debate.enemy.name} challenges back. (-${shield.loss} light, shield ${shield.shield})`);
  tickBattleStatus();
  State.Debate.pendingEnemy = null;
  State.Debate.choice = freshChoice();
  State.Debate.moves = battleOptions(State.Debate.choice);
  setPhase('choice', 0, '');
};

const logLine = (move, result, codex) => {
  const fusion = codex.unlocked?.length ? ` Fusion awakened: ${codex.unlocked.join(', ')}.` : '';
  return `${move.category} → ${move.routeTitle} → ${move.chapterTitle}: “${move.routeQuote}” (-${result.damage}) ${result.desc}.${fusion}`;
};

const healWithMove = move => {
  State.Stats.light = Math.min(State.Stats.maxLight, State.Stats.light + computeHeal(move.heal));
  pushBattleEffect('heal', 'player', move.name);
};

const grantMilestone = message => {
  const reward = garmentRewardForDebateMilestone(State.Stats.debatesWon);
  return reward && addGarment(reward) ? `${message} New garment: ${reward}.` : message;
};

const grantExp = message => {
  const reward = State.Debate.pendingReward || battleReward(State.Debate.enemy);
  State.Stats.exp += reward.exp;
  if (State.Stats.exp < State.Stats.nextExp) return message;
  State.Stats.exp -= State.Stats.nextExp;
  State.Stats.level += 1;
  State.Stats.nextExp = Math.floor(State.Stats.nextExp * 1.35);
  State.Stats.maxLight += 10;
  State.Stats.light = State.Stats.maxLight;
  return `${message} Level up!`;
};

export const endDebate = (won, message) => {
  const defeated = State.Debate.enemy;
  const move = State.Debate.lastMove || currentMoves()[0];
  if (!won) return closeDebate(message, false);
  pushBattleEffect('heal', 'player', 'victory');
  message = grantWinRewards(message, defeated, move);
  syncLightCapacity();
  State.say(message, 720);
  setPhase('reward', PHASE.reward, 'Rewards collected');
  window.AwtsmoosIntents.A = 0; window.AwtsmoosIntents.B = 0;
};

const closeDebate = (message, won) => {
  State.ActiveRealm = 'OVERWORLD';
  setPhase('choice', 0, '');
  State.say(message, won ? 620 : 360);
  window.AwtsmoosIntents.A = 0; window.AwtsmoosIntents.B = 0;
};

const grantWinRewards = (message, defeated, move) => {
  grantBattleSkills(move, defeated, true);
  const reward = battleReward(defeated);
  State.Debate.pendingReward = reward;
  State.Stats.sparks += reward.sparks;
  addMoney(reward.zuzim);
  Object.entries(reward.items || {}).forEach(([id, amount]) => addItem(id, amount));
  State.Stats.debatesWon += 1;
  recordQuestEvent('debateWon', 1);
  if (isMusag(defeated)) {
    recordQuestEvent('wildWon', 1);
    const entry = recordMusag(defeated, true);
    if (entry?.sweetened >= 3) message += ` ${entry.name} evolved in the Dex.`;
  }
  const learned = learnRouteFromMove(move, true);
  if (learned) message += ` ${learned}.`;
  const finalMessage = grantExp(grantMilestone(message));
  State.Debate.rewardText = rewardLine(reward);
  addJournalNote(`${defeated.name}: ${State.Debate.rewardText}`);
  pushRewardEffect(State.Debate.rewardText);
  return `${finalMessage} Rewards: ${State.Debate.rewardText}.`;
};

const finishRewardScreen = () => {
  const text = State.Debate.rewardText || 'Rewards gathered';
  closeDebate(`Rewards stored in Bag: ${text}.`, true);
};
