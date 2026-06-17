// B"H
/** Converts raw JSON cutscene shots into a deterministic timeline. */
function shotId(sceneId, i) { return `${sceneId || "scene"}:shot:${i + 1}`; }
export function normalizeShotTimeline(cutscene = {}) {
  const shots = Array.isArray(cutscene.shots) ? cutscene.shots : [];
  let time = 0;
  return shots.map((shot, i) => { const duration = Number(shot.duration || 3); const row = { id:shot.id || shotId(cutscene.id, i), type:shot.type || "static", target:shot.target || null, from:shot.from || null, to:shot.to || null, dialogue:shot.dialogue || null, start:time, end:time + duration, duration }; time += duration; return row; });
}
export function timelineDuration(timeline = []) { return timeline.reduce((m, s) => Math.max(m, s.end || 0), 0); }
