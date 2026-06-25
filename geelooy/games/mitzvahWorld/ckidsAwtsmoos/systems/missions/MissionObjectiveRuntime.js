// B"H
/**
 * MissionObjectiveRuntime
 * The Awtsmoos lets every tiny act count without reviving the old per-frame scan.
 * Compatibility exports are preserved for worker imports and Torah/progress code.
 */
export function objectiveDone(objective = {}, event = {}) {
  return objective.kind === event.kind && (!objective.target || objective.target === event.target);
}
export function progressActiveObjectives(olamOrRuntime = {}, kind = 'generic', amount = 1) {
  const runtime = olamOrRuntime.missionRuntime || olamOrRuntime.__missionRuntime || olamOrRuntime;
  const active = runtime?.state?.().active || runtime?.activeMissions || olamOrRuntime.activeMissions || {};
  const progressed = [];
  for (const mission of Object.values(active)) {
    const hit = (mission.objectives || []).some(objective => objective.kind === kind || objective.target === kind || objective.recipe === kind);
    if (!hit) continue;
    mission.progress = Math.min((mission.objectives?.[0]?.count || Infinity), (mission.progress || 0) + amount);
    progressed.push({ id: mission.id, progress: mission.progress });
  }
  globalThis.dispatchEvent?.(new CustomEvent('mitzvah-world:objective-progress', { detail: { kind, amount, progressed } }));
  return progressed;
}
export function createMissionObjectiveRuntime(runtime = {}) {
  return { objectiveDone, progress(kind, amount = 1) { return progressActiveObjectives(runtime, kind, amount); } };
}
export default { objectiveDone, progressActiveObjectives, createMissionObjectiveRuntime };
