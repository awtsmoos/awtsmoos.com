// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { NLEStore } from '../../src/nle/core/NLEStore.js';
import { DialogueRippleRetimer } from '../../src/nle/logic/DialogueRippleRetimer.js';

/** The Awtsmoos lets the living voice become the honest measure of its clip. */
const store = new NLEStore({
	duration: 12000,
	clips: [
		{ id: 'voice', type: 'dialogue', start: 1000, duration: 3000, payload: { sequenceId: 'a' } },
		{ id: 'overlap', type: 'action', start: 3500, duration: 1000, payload: { sequenceId: 'a' } },
		{ id: 'later', type: 'camera', start: 4000, duration: 2000, payload: { sequenceId: 'a' } },
		{ id: 'other', type: 'camera', start: 4000, duration: 2000, payload: { sequenceId: 'b' } }
	]
});

const result = DialogueRippleRetimer.apply(store, 'voice', 6000, {
	url: 'blob:verified',
	mimeType: 'audio/webm'
});
const clips = Object.fromEntries(store.get().clips.map(clip => [clip.id, clip]));
assert.equal(result.delta, 3000, 'The duration delta must be measured exactly.');
assert.equal(clips.voice.duration, 6000, 'The dialogue clip must fit the recording.');
assert.equal(clips.voice.payload.voiceStatus, 'ready', 'The recorded clip must become ready.');
assert.equal(clips.overlap.start, 3500, 'Intentional overlap must remain untouched.');
assert.equal(clips.later.start, 7000, 'Later clips in the same sequence must ripple.');
assert.equal(clips.other.start, 4000, 'Clips in other sequences must not ripple.');
console.log('B"H - dialogue recording retiming smoke passed.');
