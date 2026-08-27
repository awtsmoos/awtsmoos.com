/* B"H */
export function createSubtitleTrack(input = {}) { return { id:input.id || `subs-${Date.now()}`, kind:'SubtitleTrack', language:input.language || 'en', cues:input.cues || [] }; }
export function addCue(track, cue = {}) { const model = { id:cue.id || `cue-${track.cues.length+1}`, start:Number(cue.start || 0), end:Number(cue.end ?? (cue.start || 0) + 2), text:cue.text || '' }; track.cues.push(model); return model; }
export function cuesAt(track, time) { return track.cues.filter(c => time >= c.start && time <= c.end); }
