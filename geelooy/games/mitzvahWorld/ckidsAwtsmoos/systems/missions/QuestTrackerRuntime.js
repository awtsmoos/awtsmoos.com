// B"H
/** Quest tracker payload is idempotent data, not DOM churn. */
export function trackerRows(active = {}) { return Object.values(active).map(m=>({id:m.id,title:m.title,progress:m.progress||0,total:m.objectives?.[0]?.count||1})); }
export function questTrackerPayload(store = globalThis.__MITZVAH_WORLD_STATE__ || {}) { return { rows:trackerRows(store.activeMissions||{}), completed:store.completedMissions||[] }; }
export default { trackerRows, questTrackerPayload };
