// B"H
function allBeats(timeline = {}) { return (timeline.tracks || []).flatMap(track => (track.beats || []).map(beat => ({ ...beat, track:track.name }))); }
export function stepCutscene(cursor = {}, timeline = {}, delta = 0) { const before = cursor.time || 0, next = cursor.paused ? before : before + Number(delta || 0); const done = new Set(cursor.completedBeatIds || []); const active = allBeats(timeline).filter(b => (b.at || 0) > before && (b.at || 0) <= next && !done.has(`${b.track}:${b.kind}:${b.at}`)); active.forEach(b => done.add(`${b.track}:${b.kind}:${b.at}`)); const finished = next >= (timeline.duration || 0); return { cursor:{ ...cursor, time:next, completedBeatIds:[...done], playing:!finished, paused:false }, active, finished }; }
export default stepCutscene;
