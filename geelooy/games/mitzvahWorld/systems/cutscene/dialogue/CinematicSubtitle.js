// B"H
export function cinematicSubtitle(beat = {}) { return { kind:"subtitle", speaker:beat.speaker, text:beat.text, at:beat.at || 0 }; }
