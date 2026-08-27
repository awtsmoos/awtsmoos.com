// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { MouthPhonemeModel } from '../../src/performance/face/MouthPhonemeModel.js';
import { SpeechPerformanceEngine } from '../../src/performance/SpeechPerformanceEngine.js';

/**
 * Verification is the vessel that prevents a poetic claim from becoming a
 * false one. These assertions prove that silent dialogue in Awtsmoos.com
 * changes letters, mouth shapes, facial energy, and body acting.
 */
const firstBeat = MouthPhonemeModel.from({
	speech: 'Beautiful worlds open',
	progress: 0.08,
	silentMode: true,
	emotion: 'warm'
});
const laterBeat = MouthPhonemeModel.from({
	speech: 'Beautiful worlds open',
	progress: 0.48,
	silentMode: true,
	emotion: 'warm'
});

assert.notEqual(firstBeat.symbol, laterBeat.symbol);
assert.notEqual(firstBeat.shape, laterBeat.shape);
assert.ok(firstBeat.open > 0);

const whisper = SpeechPerformanceEngine.compose({
	speech: 'Keep the secret close',
	progress: 0.34,
	silentMode: true,
	speechStyle: 'whisper',
	emotion: 'sincere'
});
const shout = SpeechPerformanceEngine.compose({
	speech: 'Keep the secret close',
	progress: 0.34,
	silentMode: true,
	speechStyle: 'shout',
	emotion: 'urgent'
});
const idle = SpeechPerformanceEngine.compose({
	speech: '',
	progress: 0.34,
	talking: false,
	emotion: 'calm'
});

assert.ok(shout.face.mouth.open > whisper.face.mouth.open);
assert.ok(shout.body.shoulder > whisper.body.shoulder);
assert.notEqual(whisper.body.headNod, idle.body.headNod);
assert.equal(whisper.metadata.silentMode, true);
assert.equal(whisper.metadata.hasAudioEnvelope, false);

const audioDriven = MouthPhonemeModel.from({
	speech: 'Audio follows breath',
	progress: 0.22,
	audioEnvelope: 0.92,
	talking: true
});
const quietAudio = MouthPhonemeModel.from({
	speech: 'Audio follows breath',
	progress: 0.22,
	audioEnvelope: 0.08,
	talking: true
});

assert.ok(audioDriven.open > quietAudio.open);
console.log('B"H silent dialogue performance smoke passed');
