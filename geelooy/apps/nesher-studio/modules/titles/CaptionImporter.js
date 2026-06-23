/* B"H */
import { createSubtitleTrack, addCue } from './SubtitleTrack.js';
export function createCaptionImporter(input = {}) { return { kind:'CaptionImporter', format:input.format || 'vtt' }; }
export function importSimpleVtt(text = '') { const track = createSubtitleTrack(); const blocks = text.split(/\n\s*\n/).slice(1); for (const block of blocks) { const lines = block.trim().split('\n'); const timeLine = lines.find(l => l.includes('-->')); if (!timeLine) continue; const [start,end] = timeLine.split('-->').map(parseTime); addCue(track, { start, end, text:lines.at(-1) || '' }); } return track; }
function parseTime(value) { const parts = value.trim().split(':').map(Number); return parts[0]*3600 + parts[1]*60 + parts[2]; }
