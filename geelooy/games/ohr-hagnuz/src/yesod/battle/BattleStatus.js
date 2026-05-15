/**
 * B"H
 * @module BattleStatus
 * Modular midbattle status effects for Torah debates.
 */
import { State } from '../../binah/State.js';

export const ensureBattleStatus = () => {
  State.Debate.status ||= { player: {}, enemy: {} };
  State.Debate.turn ||= 0;
  return State.Debate.status;
};

export const applyStatusFromMove = (move, result) => {
  const status = ensureBattleStatus();
  const text = `${move.name} ${move.text}`.toLowerCase();
  if (text.includes('clarity')) status.enemy.dazed = 2;
  if (text.includes('warmth')) status.player.fervor = 2;
  if (text.includes('light')) status.enemy.shattered = 2;
  if (text.includes('joy') || move.heal) status.player.joy = 2;
  if (result?.crit) status.enemy.awe = 1;
};

export const preEnemyReply = (raw) => {
  const status = ensureBattleStatus();
  let value = raw;
  if (status.enemy.dazed) value = Math.floor(value * 0.7);
  if (status.player.joy) value = Math.max(1, value - 2);
  return Math.max(1, value);
};

export const tickBattleStatus = () => {
  const status = ensureBattleStatus();
  State.Debate.turn += 1;
  for (const side of ['player', 'enemy']) {
    for (const key of Object.keys(status[side])) {
      status[side][key] -= 1;
      if (status[side][key] <= 0) delete status[side][key];
    }
  }
  return status;
};

export const statusLine = () => {
  const status = ensureBattleStatus();
  const p = Object.keys(status.player).join(', ') || 'clear';
  const e = Object.keys(status.enemy).join(', ') || 'clear';
  return `Player: ${p} | Opponent: ${e}`;
};
