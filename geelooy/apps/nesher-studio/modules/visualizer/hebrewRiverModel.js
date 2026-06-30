/* B"H
Hebrew river model: glyph streams flow like living water under audio command.
*/
import { band } from './audioFeatures.js';
import { hebrewAt } from './hebrewLetters.js';
export function hebrewRiverGlyphs(source, frame) {
  const text = source.settings?.hebrewText;
  const rows = Math.max(4, Math.min(10, Math.round((source.settings?.bars || 36) / 7)));
  const beat = band(frame, 'pulse'), bass = band(frame, 'bass'), treble = band(frame, 'treble');
  const speed = 35 + bass * 180 + beat * 140, dir = frame.features?.beat ? -1 : 1;
  return Array.from({ length:rows }, (_, row) => rowGlyphs({ row, rows, source, frame, text, speed, dir, treble })).flat();
}
export function riverMetadata(source) {
  return { family:source.sourceFamily || source.meta?.sourceFamily || 'hebrew-river', preset:source.settings?.preset || 'hebrewRiver', source:'deterministic-audio-frame' };
}
function rowGlyphs(input) {
  const count = 10 + input.row * 2, y = (input.row + .65) / input.rows * input.source.h;
  return Array.from({ length:count }, (_, i) => glyph(input, i, count, y));
}
function glyph({ row, rows, source, frame, text, speed, dir, treble }, i, count, y) {
  const depth = .45 + row / Math.max(1, rows - 1) * .75;
  const drift = (frame.t * speed * dir * depth + i * source.w / count + row * 47) % (source.w + 80);
  const x = dir > 0 ? drift - 40 : source.w - drift + 40;
  const amp = frame.freq?.[(i + row * 5) % (frame.freq.length || 1)] || frame.level || 0;
  return { glyph:hebrewAt(i + row * 11 + frame.index, text), x, y:y + Math.sin(i + frame.t * 2) * 10 * depth, depth, alpha:.35 + amp * .55, size:16 + amp * 30 + treble * 12, glow:4 + amp * 22, row, speed };
}
