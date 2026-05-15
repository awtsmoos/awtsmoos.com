/** B"H * @module OhrDebate */
import { State } from '../binah/State.js';
import { recordQuestEvent } from './OhrQuest.js';
import {
  addGarment,
  computeDebateDamage,
  computeDefenseLoss,
  computeHeal,
  garmentRewardForDebateMilestone,
  resolveStats,
  syncLightCapacity
} from './equipment/EquipmentRuntime.js';
import { currentMoves } from './abilities/AbilityRuntime.js';
import { pushBattleEffect } from '../tiferet/render/BattleEffects.js';
import { battleReward, resolveBattleRank, scaleEnemyLight } from './battle/BattleRank.js';
import { applyStatusFromMove, ensureBattleStatus, preEnemyReply, tickBattleStatus } from './battle/BattleStatus.js';
import { ensureSkills, grantBattleSkills } from './skills/SkillRuntime.js';
import { isMusag, recordMusag } from './musag/MusagDex.js';

export const startDebate = (encounter) => {
  syncLightCapacity();
  ensureSkills();
  const stats = resolveStats();
  const scaledLight = scaleEnemyLight(encounter);

  State.ActiveRealm = 'DEBATE';
  State.HeroPath = [];
  State.Debate.enemy = encounter;
  State.Debate.rank = resolveBattleRank(encounter);
  State.Debate.enemyLight = scaledLight;
  State.Debate.enemyMaxLight = scaledLight;
  State.Debate.cursor = 0;
  State.Debate.moves = currentMoves();
  State.Debate.status = { player: {}, enemy: {} };
  State.Debate.turn = 0;
  ensureBattleStatus();
  State.BattleFx = [];
  if (isMusag(encounter)) recordMusag(encounter, false);
  if (isMusag(encounter)) recordMusag(encounter, false);
  State.Debate.log = [
    `${State.Debate.rank.label}: ${encounter.lesson}`,
    `${stats.garment?.icon || '*'} ${stats.garment?.name || 'No garment'} awakens your sefiros.`,
    'Choose a Torah response: arrows/Enter, click, or keys 1-4.'
  ];

  State.say(`Debate: ${encounter.name}`, 360);
};

export const selectDebateMove = (index) => {
  if (State.ActiveRealm !== 'DEBATE') return false;
  useMove(index);
  return true;
};

export const debateTick = (held) => {
  const i = window.AwtsmoosIntents || {};
  if (i.U && !held.u) State.Debate.cursor = (State.Debate.cursor + 3) % 4;
  if (i.D && !held.d) State.Debate.cursor = (State.Debate.cursor + 1) % 4;
  if (i.B && !held.b) endDebate(false, 'You withdrew from the debate.');
  if (i.A && !held.a) useMove(State.Debate.cursor);
  held.u = i.U; held.d = i.D; held.a = i.A; held.b = i.B;
};

export const useMove = (index) => {
  const move = State.Debate.moves[index];
  if (!move) return;

  const result = computeDebateDamage(move);
  grantBattleSkills(move, State.Debate.enemy, false);
  grantBattleSkills(move, State.Debate.enemy, false);
  State.Debate.enemyLight = Math.max(0, State.Debate.enemyLight - result.damage);
  pushBattleEffect('hit', 'enemy', move.name);
  applyStatusFromMove(move, result);

  if (move.heal) {
    State.Stats.light = Math.min(State.Stats.maxLight, State.Stats.light + computeHeal(move.heal));
    pushBattleEffect('heal', 'player', move.name);
  }

  State.Debate.log.unshift(`${move.text} (-${result.damage})$ {result.desc}.`);

  if (State.Debate.enemyLight <= 0) return endDebate(true, `${State.Debate.enemy.name} is sweetened. You gain sparks.`);

  const raw = preEnemyReply(5 + Math.floor(Math.random() * 10));
  const shield = computeDefenseLoss(raw);
  State.Stats.light = Math.max(1, State.Stats.light - shield.loss);
  pushBattleEffect('shield', 'player', 'shield');
  State.Debate.log.unshift(`${State.Debate.enemy.name} challenges back. (-${shield.loss} light, shield ${shield.shield})`);
  tickBattleStatus();
};

const grantMilestone = (message) => {
  const reward = garmentRewardForDebateMilestone(State.Stats.debatesWon);
  if (reward && addGarment(reward)) message += ` New garment: ${reward}.`;
  return message;
};

const grantExp = (message) => {
  const reward = State.Debate.enemy ? battleReward(State.Debate.enemy) : { exp: 15 };
  State.Stats.exp += reward.exp;
  if (State.Stats.exp >= State.Stats.nextExp) {
    State.Stats.exp -= State.Stats.nextExp;
    State.Stats.level += 1;
    State.Stats.nextExp = Math.floor(State.Stats.nextExp * 1.35);
    State.Stats.maxLight += 10;
    State.Stats.light = State.Stats.maxLight;
    message += ' Level up!';
  }
  return message;
};

export const endDebate = (won, message) => {
  const defeated = State.Debate.enemy;
  State.ActiveRealm = 'OVERWORLD';
  if (won) {
    grantBattleSkills(State.Debate.moves[State.Debate.cursor], defeated, true);
    pushBattleEffect('heal', 'player', 'victory');
    const reward = battleReward(defeated);
    State.Stats.sparks += reward.sparks;
    State.Stats.debatesWon += 1;
    recordQuestEvent('debateWon', 1);
    if (defeated?.name?.startsWith('Wild Musag')) {
      recordQuestEvent('wildWon', 1);
      recordMusag(defeated, true);
    }
    message = grantMilestone(message);
    message = grantExp(message);
  }
  syncLightCapacity();
  State.say(message, 420);
  window.AwtsmoosIntents.A = 0;
  window.AwtsmoosIntents.B = 0;
};
