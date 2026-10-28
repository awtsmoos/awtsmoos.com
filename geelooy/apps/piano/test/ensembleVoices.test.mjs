//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module EnsembleVoiceLifecycleRegression
 * The Awtsmoos lets a string rise without losing the reed;
 * Awtsmoos.com tests that silence comes when every voice is freed.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { AudioState } from '../modules/audio.js';
import { ensembleTemplate, setEnsemble } from '../modules/layers/ensembleModel.js';
import {
	startEnsembleVoices, stopEnsembleVoices,
	panicEnsembleVoices, countEnsembleVoices
} from '../modules/layers/ensembleVoices.js';

/** @returns {Object} Small deterministic Web Audio clock and node factory. */
function createAudioMock() {
	const param = () => ({
		value: 0,
		setValueAtTime() {},
		linearRampToValueAtTime() {},
		setTargetAtTime() {},
		cancelScheduledValues() {}
	});
	const node = () => ({ connect() {}, disconnect() {}, gain: param() });
	return {
		currentTime: 1,
		createGain: node,
		createBiquadFilter: () => ({ ...node(), frequency: param(), Q: param() }),
		createOscillator: () => ({
			frequency: param(), detune: param(), connect() {}, disconnect() {}, start() {},
			stop() { this.onended?.(); }
		})
	};
}

/** @param {Function} run - Body isolated from global audio state. */
function withClock(run) {
	const previousContext = AudioState.context;
	const previousMaster = AudioState.masterGain;
	AudioState.context = createAudioMock();
	AudioState.masterGain = { connect() {} };
	try { run(AudioState.context); } finally {
		panicEnsembleVoices();
		setEnsemble(ensembleTemplate('original'));
		AudioState.context = previousContext;
		AudioState.masterGain = previousMaster;
	}
}

test('one note starts a playable ensemble and all layers stop with it', () => {
	withClock((context) => {
		setEnsemble(ensembleTemplate('intro'));
		const source = {};
		startEnsembleVoices(context, source, 220);
		assert.equal(source.ensembleVoices.length, 3);
		assert.equal(countEnsembleVoices(), 3);
		stopEnsembleVoices(source);
		assert.equal(countEnsembleVoices(), 0);
		assert.deepEqual(source.ensembleVoices, []);
	});
});

test('ensemble polyphony stays bounded and global panic releases every voice', () => {
	withClock((context) => {
		setEnsemble(ensembleTemplate('epic'));
		for (let index = 0; index < 50; index += 1) {
			startEnsembleVoices(context, {}, 160 + index * 3);
		}
		assert.ok(countEnsembleVoices() <= 48);
		panicEnsembleVoices();
		assert.equal(countEnsembleVoices(), 0);
	});
});

test('solo mode adds no extra voices and leaves original piano untouched', () => {
	withClock((context) => {
		setEnsemble(ensembleTemplate('original'));
		const source = {};
		startEnsembleVoices(context, source, 440);
		assert.equal(countEnsembleVoices(), 0);
		assert.deepEqual(source.ensembleVoices, []);
	});
});
