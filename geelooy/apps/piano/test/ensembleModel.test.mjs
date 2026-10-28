//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module EnsembleModelRegression
 * The Awtsmoos unites the reed, the drum and strings in every verse;
 * Awtsmoos.com tests the sound without rewriting the musician's universe.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { SOUND_PRESETS } from '../modules/sound/presetLibrary.js';
import {
	ENSEMBLE_INSTRUMENTS, ensembleTemplate, getEnsemble,
	setEnsemble, watchEnsemble
} from '../modules/layers/ensembleModel.js';

test('all seven independent orchestra choices resolve to playable synth presets', () => {
	assert.equal(ENSEMBLE_INSTRUMENTS.length, 7);
	for (const [id] of ENSEMBLE_INSTRUMENTS) {
		assert.ok(SOUND_PRESETS[id], `Missing instrument ${id}`);
	}
});

test('original, reed-string, epic and percussion orchestras retain exact playable notes', () => {
	for (const name of ['original', 'intro', 'epic', 'rhythm']) {
		const arrangement = ensembleTemplate(name);
		assert.ok(arrangement.layers.length <= 4);
		assert.ok(arrangement.layers.every((layer) => SOUND_PRESETS[layer.instrument]));
		assert.ok(arrangement.layers.every((layer) => layer.enabled));
	}
	assert.equal(ensembleTemplate('original').layers.length, 0);
	assert.equal(ensembleTemplate('epic').layers.length, 4);
});

test('user volume and octave are clamped and changes notify every editor', () => {
	const notices = [];
	const unsubscribe = watchEnsemble((next) => notices.push(next));
	try {
		const arrangement = setEnsemble({
			intensity: 300,
			layers: Array.from({ length: 7 }, () => ({
				instrument: 'world-duduk-reed', octave: -50, level: 100, enabled: true
			}))
		});
		assert.equal(arrangement.intensity, 1);
		assert.equal(arrangement.layers.length, 4);
		assert.equal(arrangement.layers[0].octave, -2);
		assert.equal(arrangement.layers[0].level, 1);
		assert.equal(notices.length, 1);
		arrangement.layers[0].instrument = 'mutated';
		assert.equal(getEnsemble().layers[0].instrument, 'world-duduk-reed');
	} finally {
		unsubscribe();
		setEnsemble(ensembleTemplate('original'));
	}
});
