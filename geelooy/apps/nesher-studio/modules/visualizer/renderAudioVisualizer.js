/* B"H
Audio visualizer renderer: routed sound becomes presets, features, custom overlays.
*/
import { audioFrameFor } from './audioFrame.js';
import { runCustomVisualizer } from './customVisualizer.js';
import { presetById } from './presets/index.js';
import { visualizerFamilyInfo } from './sourceFamilyLabel.js';
import { visualizerHelpers } from './visualizerHelpers.js';
export function renderAudioVisualizer(ctx, source) {
  const frame = audioFrameFor(source); drawBackground(ctx, source, frame);
  presetById(source.settings?.preset).render(ctx, source, frame, visualizerHelpers);
  runCustomVisualizer(ctx, source, frame); drawCaption(ctx, source, frame); return true;
}
function drawBackground(ctx, source, frame) {
  const g = ctx.createLinearGradient(0, 0, source.w, source.h);
  g.addColorStop(0, source.settings?.bgA || '#070b16'); g.addColorStop(1, source.settings?.bgB || '#102a3f');
  ctx.fillStyle = g; ctx.fillRect(0, 0, source.w, source.h);
  if (source.settings?.glow !== false) { const a = Math.min(.28, frame.features.level * .24 + frame.features.pulse * .18); ctx.fillStyle = `rgba(131,255,231,${a})`; ctx.fillRect(0, 0, source.w, source.h); }
}
function drawCaption(ctx, source, frame) {
  const names = frame.sources.map(s => s.name).slice(0, 3).join(' + ') || 'synthetic/screen energy';
  const family = visualizerFamilyInfo(source), preset = source.settings?.preset || 'preset';
  ctx.fillStyle = '#dbe7ff'; ctx.font = 'bold 20px sans-serif'; ctx.fillText(source.name, 18, 34);
  ctx.fillStyle = '#9fb4ff'; ctx.font = '13px monospace'; ctx.fillText(`${family?.label || 'Visualizer'} · ${preset}`.slice(0, 74), 18, 54);
  ctx.fillText(`visualizing: ${names}`.slice(0, 74), 18, source.h - 18);
  ctx.fillText(`bass ${frame.features.bass.toFixed(2)} mid ${frame.features.mid.toFixed(2)} treble ${frame.features.treble.toFixed(2)}`, 18, source.h - 36);
  if (source.visualizerRuntime?.customError) { ctx.fillStyle = '#ff8da1'; ctx.fillText(`custom JS: ${source.visualizerRuntime.customError}`.slice(0, 70), 18, 76); }
}
