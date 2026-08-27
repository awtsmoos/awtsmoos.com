/* B"H
Studio export gathers the footprints of notes so future encoders can press them into WAV, MIDI, and flame.
*/
export function notesToMidiLikeEvents(notes) { return notes.flatMap(n => [{ type:'noteOn', note:n.note, time:n.start }, { type:'noteOff', note:n.note, time:n.start+n.duration }]).sort((a,b)=>a.time-b.time); }
export function makeSessionBlob(session) { return new Blob([JSON.stringify(session, null, 2)], { type: 'application/json' }); }
export function downloadBlob(blob, name) { const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=name; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href), 2000); }
