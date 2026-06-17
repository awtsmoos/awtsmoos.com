// B"H
export function cinematicAudioCue(id, kind = "ambience", at = 0) { return { kind:"audio_cue", id, audioKind:kind, at }; }
