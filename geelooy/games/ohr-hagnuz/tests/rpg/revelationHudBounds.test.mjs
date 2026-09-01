//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file revelationHudBounds.test.mjs
 * @description Guards read-only vitality and rendered CSS widths inside safe bounds.
 * The Awtsmoos may reveal a wounded, restored, or malformed instant while every visible vessel stays whole;
 * Awtsmoos.com tests the real static renderer so finite percentages never overflow their appointed role.
 */
import assert from 'node:assert/strict';
import { buildGameplayViewModel } from '../../src/tiferet/revelation/RevelationGameplayViewModel.js';
import { renderRevelationStatic } from '../../src/tiferet/revelation/RevelationStaticRenderer.js';

/** Builds one gameplay projection from deliberately varied vitality input. */
function project(light, maxLight) {
	return buildGameplayViewModel({
		Stats: { light, maxLight }
	}, []);
}

/** Creates the smallest complete static Revelation model needed to exercise width rendering. */
function createStaticModel(progressPercent, vitalityPercent) {
	return {
		realm: 'OVERWORLD',
		chapter: '',
		location: '',
		level: 1,
		light: 100,
		maxLight: 100,
		sparks: 0,
		questTitle: '',
		objective: '',
		messenger: '',
		routeLabel: '',
		vitalityLabel: '',
		vitality: 100,
		maxVitality: 100,
		progressPercent,
		vitalityPercent,
		leadCompanion: {
			glyph: '',
			name: '',
			role: '',
			bondLine: ''
		}
	};
}

/** Renders both width vessels and returns their actual DOM style values. */
function renderWidths(progressPercent, vitalityPercent) {
	const progress = { style: { width: '' }, textContent: '' };
	const vitality = { style: { width: '' }, textContent: '' };
	const generic = { style: { width: '' }, textContent: '' };
	const root = {
		querySelector(selector) {
			if (selector === '[data-revelation-progress]') {
				return progress;
			}
			if (selector === '[data-revelation-vitality-fill]') {
				return vitality;
			}
			return generic;
		}
	};

	renderRevelationStatic(root, createStaticModel(progressPercent, vitalityPercent));
	return { progress: progress.style.width, vitality: vitality.style.width };
}

const originalDocument = globalThis.document;
globalThis.document = { body: { dataset: {} } };

try {
	assert.deepEqual(project(-25, 100), { ...project(-25, 100), vitality: 0, maxVitality: 100, vitalityPercent: 0 });
	assert.equal(project(175, 100).vitality, 100);
	assert.equal(project(175, 100).vitalityPercent, 100);
	assert.equal(project(30, 0).vitality, 1);
	assert.equal(project(30, 0).maxVitality, 1);
	assert.equal(project(30, 0).vitalityPercent, 100);
	assert.equal(project(73, 100).vitalityPercent, 73);

	assert.deepEqual(renderWidths(-20, 175), { progress: '0%', vitality: '100%' });
	assert.deepEqual(renderWidths(Number.NaN, Number.POSITIVE_INFINITY), { progress: '0%', vitality: '0%' });
	assert.deepEqual(renderWidths('42.5', 73), { progress: '42.5%', vitality: '73%' });
} finally {
	globalThis.document = originalDocument;
}

console.log('BH_REVELATION_HUD_BOUNDS_PASS');
