/** B"H @module PrestigeRuntime - postgame mastery/prestige loop. */
import { State } from '../../binah/State.js';

export const ensurePrestige = () => {
  State.Prestige ||= { rank: 0, points: 0, history: [] };
  State.Prestige.history ||= [];
  State.Prestige.points ||= 0;
  State.Prestige.rank ||= 0;
  return State.Prestige;
};

export const canPrestige = () => {
  const declared = State.Story?.active === 'Ohr HaGnuz Revealed';
  const achievements = Object.keys(State.Achievements?.unlocked || {}).length;
  return declared && achievements >= 3;
};

export const performPrestige = (source = 'postgame') => {
  if (!canPrestige()) return { ok: false, reason: 'requirements-not-met' };
  const state = ensurePrestige();
  state.rank += 1;
  state.points += 10 + state.rank;
  state.history.unshift({ source, rank: state.rank, at: new Date().toISOString() });
  return { ok: true, rank: state.rank, points: state.points };
};
