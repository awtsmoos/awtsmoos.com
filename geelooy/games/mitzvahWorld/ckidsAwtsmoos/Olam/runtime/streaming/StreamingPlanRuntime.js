/**
 * B"H
 * @file StreamingPlanRuntime.js
 *
 * Chapter 36: The Horizon Prepared Its Neighboring Worlds.
 *
 * The Awtsmoos lets a walking player pull nearby maps toward life while far
 * maps fall asleep without forgetting. This planner is pure: it decides load
 * and unload sets from graph data, never from rendering side effects.
 */

export function planStreaming({ currentMapId, loaded = [], graph = {} }) {
  const keep = new Set([currentMapId, ...(graph[currentMapId] || [])]);
  const loadedSet = new Set(loaded);
  const load = [...keep].filter(id => id && !loadedSet.has(id));
  const unload = [...loadedSet].filter(id => !keep.has(id));
  return { keep: [...keep].filter(Boolean), load, unload };
}
