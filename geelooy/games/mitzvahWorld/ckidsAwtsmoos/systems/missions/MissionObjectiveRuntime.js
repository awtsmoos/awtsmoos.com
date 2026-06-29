// B"H
/** Objectives progress by real gameplay verbs: deliver, craft, clarify, help. */
export function progressActiveObjectives(runtime, kind='help', amount=1){ return runtime?.progress?.(kind,amount) || []; }
export function objectiveRows(mission){ return (mission?.objectives||[]).map(o=>({ ...o, complete:(o.done||0)>=o.needed })); }
export default { progressActiveObjectives, objectiveRows };
