// B"H
export function makeCursor(sceneId, time = 0) { return { sceneId, time, playing:true, paused:false, completedBeatIds:[] }; }
export function advanceCursor(cursor = {}, delta = 0) { return { ...cursor, time:(cursor.time || 0) + (cursor.paused ? 0 : Number(delta || 0)) }; }
export default makeCursor;
