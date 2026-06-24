/** B"H @module ReputationRuntime - faction and region standing. */
import { State } from '../../binah/State.js';
import { FactionIndex, rankForStanding } from '../../data/reputation/FactionIndex.js';

export const ensureReputation = () => {
  State.Reputation ||= { factions: {}, history: [] };
  State.Reputation.factions ||= {};
  State.Reputation.history ||= [];
  return State.Reputation;
};

export const addReputation = (factionId, amount, source = 'unknown') => {
  const faction = FactionIndex[factionId];
  if (!faction) return { ok: false, reason: 'unknown-faction' };
  const state = ensureReputation();
  const current = state.factions[factionId] || { standing: 0, rank: 'stranger' };
  current.standing = Math.max(0, current.standing + (amount | 0));
  current.rank = rankForStanding(current.standing);
  current.region = faction.region;
  state.factions[factionId] = current;
  state.history.unshift({ factionId, amount, source, rank: current.rank, at: new Date().toISOString() });
  state.history = state.history.slice(0, 40);
  return { ok: true, faction, standing: current.standing, rank: current.rank };
};

export const reputationRows = () => Object.entries(ensureReputation().factions).map(([id, f]) => [id, `${f.rank} • ${f.standing}`]);
