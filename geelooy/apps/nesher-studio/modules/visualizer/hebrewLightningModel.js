/* B"H
Hebrew lightning model: bass forks, treble dusts the air with tiny holy sparks.
*/
import { band } from './audioFeatures.js';
import { hebrewAt } from './hebrewLetters.js';
export function hebrewLightningBolts(source, frame) {
  const flash = Math.max(band(frame, 'bass'), band(frame, 'pulse'));
  const branches = 2 + Math.round(flash * 6), seed = (frame.index || 0) + Math.round(flash * 1000);
  return Array.from({ length:branches }, (_, i) => branch(source, frame, seed + i * 17, i, branches));
}
export function hebrewLightningParticles(source, frame) {
  const count = 8 + Math.round(band(frame, 'treble') * 46), seed = (frame.index || 0) * 31;
  return Array.from({ length:count }, (_, i) => ({ x:rand(seed + i) * source.w, y:rand(seed + i * 7) * source.h, glyph:hebrewAt(i + frame.index, source.settings?.hebrewText), size:8 + rand(seed + i * 13) * 14, alpha:.25 + band(frame, 'treble') * .65 }));
}
function branch(source, frame, seed, index, total) {
  const startX = source.w * (.15 + index / Math.max(1, total - 1) * .7), points = [{ x:startX, y:0, glyph:hebrewAt(index + frame.index, source.settings?.hebrewText) }];
  const steps = 5 + Math.round(band(frame, 'bass') * 5);
  for (let i = 1; i <= steps; i++) points.push(point(source, frame, seed, index, i, steps));
  return { points, flash:band(frame, 'pulse'), fork:index > 1 && frame.features?.beat };
}
function point(source, frame, seed, branchIndex, step, steps) {
  const wobble = (rand(seed + step * 19) - .5) * source.w * (.25 + band(frame, 'bass') * .2);
  return { x:source.w / 2 + wobble + (branchIndex - 1) * 18, y:step / steps * source.h, glyph:hebrewAt(seed + step + frame.index, source.settings?.hebrewText) };
}
function rand(seed) { const x = Math.sin(seed * 12.9898) * 43758.5453; return x - Math.floor(x); }
