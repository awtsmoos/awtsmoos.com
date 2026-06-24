/** B"H @module WorldCompletionRuntime - discovery and region completion summaries. */
import { State } from '../../binah/State.js';

export const ensureWorldCompletion = () => {
  State.WorldCompletion ||= { discovered: {}, regions: {}, history: [] };
  State.WorldCompletion.discovered ||= {};
  State.WorldCompletion.regions ||= {};
  State.WorldCompletion.history ||= [];
  return State.WorldCompletion;
};

export const discoverMap = (mapId = State.MapId, region = 'unknown') => {
  const state = ensureWorldCompletion();
  if (!mapId) return { ok: false, reason: 'missing-map' };
  state.discovered[mapId] = true;
  state.regions[region] ||= { maps: {}, complete: false };
  state.regions[region].maps[mapId] = true;
  State.rememberMap?.(mapId);
  state.history.unshift({ mapId, region, at: new Date().toISOString() });
  state.history = state.history.slice(0, 40);
  return { ok: true, mapId, region };
};

export const markRegionComplete = region => {
  const state = ensureWorldCompletion();
  state.regions[region] ||= { maps: {}, complete: false };
  state.regions[region].complete = true;
  return { ok: true, region };
};

export const worldCompletionSummary = () => {
  const state = ensureWorldCompletion();
  const maps = Object.keys({ ...(State.VisitedMaps || {}), ...state.discovered }).length;
  const regions = Object.values(state.regions);
  const completeRegions = regions.filter(r => r.complete).length;
  return { maps, regions: regions.length, completeRegions };
};
