//B"H
import { normalizeTarget } from './targets.js';

export function createAudioNote({ target, audioId, transcript = '', start = 0, end = 0 } = {}) {
  return {
    kind: 'audioNote',
    target: normalizeTarget(target),
    audioId: String(audioId || ''),
    transcript: String(transcript || ''),
    range: { start: Number(start || 0), end: Number(end || start || 0) }
  };
}

export function audioNoteKey(note = {}) {
  return [note.audioId || '', note.range?.start || 0, note.range?.end || 0].join(':');
}
