/**
 * B"H
 * @module AchievementRuntime
 * @description Passive achievement unlocks and completion score.
 *
 * Chapter 408: The journey learned to ring bells without becoming a machine.
 * The Awtsmoos needs no trophy, yet the player needs signs that old acts still
 * shine. Achievements make every future system echo backward into retention.
 */
import { State } from '../../binah/State.js';
import { AchievementIndex, allAchievements } from '../../data/achievements/AchievementIndex.js';

export const ensureAchievements = () => {
  State.Achievements ||= { unlocked: {}, points: 0, history: [] };
  State.Achievements.unlocked ||= {};
  State.Achievements.history ||= [];
  State.Achievements.points ||= 0;
  return State.Achievements;
};

export const unlockAchievement = id => {
  const def = AchievementIndex[id];
  if (!def) return { ok: false, reason: 'unknown-achievement' };
  const state = ensureAchievements();
  if (state.unlocked[id]) return { ok: true, duplicate: true, achievement: state.unlocked[id] };
  const achievement = { id, ...def, unlockedAt: new Date().toISOString() };
  state.unlocked[id] = achievement;
  state.points += def.points || 0;
  state.history.unshift(id);
  State.say?.(`Achievement: ${def.title}`, 420);
  return { ok: true, achievement };
};

const checks = {
  first_save: () => true,
  first_storage: () => (State.Storage?.money || 0) > 0 || Object.keys(State.Storage?.items || {}).length > 0 || (State.Storage?.garments || []).length > 0,
  first_instance: () => Object.keys(State.ItemInstances?.items || {}).length > 0,
  musag_bronze: () => (State.MusagDex?.seenCount || 0) > 0 || Object.keys(State.MusagDex?.found || {}).length > 0,
  quest_first: () => Object.keys(State.Quests?.completed || {}).length > 0,
  ten_debates: () => (State.Stats?.debatesWon || 0) >= 10 || (State.Quests?.counters?.debateWon || 0) >= 10,
  declaration: () => State.Story?.active === 'Ohr HaGnuz Revealed'
};

export const evaluateAchievements = () => allAchievements().reduce((unlocked, { id }) => {
  if (checks[id]?.() && unlockAchievement(id).ok) unlocked.push(id);
  return unlocked;
}, []);

export const achievementRows = () => {
  const state = ensureAchievements();
  return allAchievements().map(({ id, title, points }) => [state.unlocked[id] ? '✓' : '○', `${title} • ${points} pts`]);
};

export const achievementSummary = () => {
  const state = ensureAchievements();
  const total = allAchievements().length;
  const done = Object.keys(state.unlocked).length;
  return { done, total, points: state.points, percent: Math.round((done / Math.max(1, total)) * 100) };
};
