// B"H
<<<<<<< HEAD
/**
 * QuestTrackerRuntime
 * The Awtsmoos breathes the starter village into ordered life: service, story,
 * memory, training, profession, reputation, and performance-safe wonder.
 */

export function trackerRows(active={}){ return Object.values(active).map(m=>({id:m.id,title:m.title,progress:m.progress||0,total:m.objectives?.[0]?.count||1})); }
export function questTrackerPayload(olam={}){ const active=olam.__activeMissions||olam.activeMissions||{}; const rows=trackerRows(active); const fallback=rows.length?[]:[{ id:"starter_shlichus", title:"First Village Path", line:"Help the village and refine wild sparks.", complete:true, objectives:[{ line:"Talk to NPCs, defeat wildlife, and loot carcasses.", current:3, needed:3, complete:true }] }]; const mapped=rows.map(r=>({ ...r, line:`${r.title}: ${r.progress}/${r.total}`, complete:r.progress>=r.total, objectives:[{ line:`Progress ${r.progress}/${r.total}`, current:r.progress, needed:r.total, complete:r.progress>=r.total }] })); return { active:mapped.concat(fallback), completedReady:mapped.filter(r=>r.complete).concat(fallback.filter(r=>r.complete)) }; }
=======
/** Quest tracker payload is idempotent data, not DOM churn. */
export function trackerRows(active = {}) { return Object.values(active).map(m=>({id:m.id,title:m.title,progress:m.progress||0,total:m.objectives?.[0]?.count||1})); }
export function questTrackerPayload(store = globalThis.__MITZVAH_WORLD_STATE__ || {}) { return { rows:trackerRows(store.activeMissions||{}), completed:store.completedMissions||[] }; }
>>>>>>> 203e677cf2795021c8a1f733832a69b99c439c8b
export default { trackerRows, questTrackerPayload };
