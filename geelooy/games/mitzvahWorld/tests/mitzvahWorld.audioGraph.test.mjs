import assert from 'node:assert/strict';
import { buildAmbientLayers, summarizeAudioGraph } from '../ckidsAwtsmoos/Olam/runtime/audio/AmbientAudioGraph.js';

const layers = buildAmbientLayers({ weather: 'rain', indoor: true, niggun: 'quiet_hope', footsteps: true, surface: 'wood' });
assert.deepEqual(layers.map(layer => layer.id), [
  'base_silence',
  'weather_rain',
  'indoor_muffle',
  'niggun_quiet_hope',
  'steps_wood'
]);
assert.equal(summarizeAudioGraph(layers) > 1, true);

console.log('B"H audio graph passed');
