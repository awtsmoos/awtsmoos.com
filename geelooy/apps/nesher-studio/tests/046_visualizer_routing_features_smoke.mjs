import assert from 'node:assert/strict';
import { analyzeAudioFeatures } from '../modules/visualizer/audioFeatures.js';
import { makeAudioVisualizerSource } from '../modules/visualizer/audioVisualizerSource.js';
import { applyInputValue } from '../modules/visualizer/visualizerRouting.js';
import { VISUALIZER_PRESETS, applyPreset } from '../modules/visualizer/presets/index.js';
const state = { selectedId:'a', sources:[audio('a'), audio('b'), { id:'v', type:'canvas' }] };
const source = makeAudioVisualizerSource(state); assert.equal(source.sourcesProvider().length, 2);
applyInputValue(source.settings, 'selected'); assert.deepEqual(source.sourcesProvider().map(s => s.id), ['a']);
applyInputValue(source.settings, 'source:b'); assert.deepEqual(source.sourcesProvider().map(s => s.id), ['b']);
const runtime = {}, features = analyzeAudioFeatures(Float32Array.from([.9,.8,.7,.2,.2,.1,.05,.02]), runtime);
assert.ok(features.bass > features.treble); assert.ok('beat' in features); assert.ok(VISUALIZER_PRESETS.length >= 5);
applyPreset(source.settings, 'hebrewRain'); assert.equal(source.settings.preset, 'hebrewRain');
console.log('B"H visualizer routing and features smoke passed');
function audio(id) { return { id, name:id, type:'audioInput', audioOnly:true }; }
