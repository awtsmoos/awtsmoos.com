/**
 * B"H
 * @file AmbientAudioGraph.js
 *
 * Chapter 37: The Wind Remembered The Niggun.
 *
 * The Awtsmoos lets silence and sound become structured mercy. This graph
 * chooses layered ambience from place, weather, and interior state, returning
 * small mixer packets for a future audio engine.
 */

export function buildAmbientLayers(context = {}) {
  const layers = [{ id: 'base_silence', gain: 0.15 }];
  if (context.weather) layers.push({ id: `weather_${context.weather}`, gain: 0.5 });
  if (context.indoor) layers.push({ id: 'indoor_muffle', gain: 0.7 });
  if (context.niggun) layers.push({ id: `niggun_${context.niggun}`, gain: context.indoor ? 0.35 : 0.6 });
  if (context.footsteps) layers.push({ id: `steps_${context.surface || 'stone'}`, gain: 0.4 });
  return layers;
}

export function summarizeAudioGraph(layers = []) {
  return layers.reduce((sum, layer) => sum + layer.gain, 0);
}
