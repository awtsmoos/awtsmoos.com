// B"H
/** Quest tracker payload is idempotent data, not DOM churn. */
export function trackerRows(active = {}) {
  return Object.values(active).map(m => {
    const objective = m.objectives?.[0] || {};
    const total = Number(objective.count ?? objective.needed ?? 1) || 1;
    const progress = Number(m.progress ?? objective.progress ?? objective.done ?? objective.current ?? 0) || 0;
    return { id:m.id, title:m.title, progress, total };
  });
}

export function questTrackerPayload(store = globalThis.__MITZVAH_WORLD_STATE__ || {}) {
  const activeMap = store.__activeMissions || store.activeMissions || {};
  const rows = trackerRows(activeMap);
  const fallback = rows.length ? [] : [{
    id:"starter_shlichus",
    title:"First Village Path",
    line:"Help the village and refine wild sparks.",
    complete:true,
    objectives:[{ line:"Talk to NPCs, defeat wildlife, and loot carcasses.", current:3, needed:3, complete:true }]
  }];
  const active = rows.map(r => ({ ...r, line:`${r.title}: ${r.progress}/${r.total}`, complete:r.progress >= r.total, objectives:[{ line:`Progress ${r.progress}/${r.total}`, current:r.progress, needed:r.total, complete:r.progress >= r.total }] })).concat(fallback);
  return { rows, completed:store.completedMissions || [], active, completedReady:active.filter(r => r.complete) };
}

export default { trackerRows, questTrackerPayload };
