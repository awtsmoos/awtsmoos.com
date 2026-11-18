// B"H
/**
 * @file MinimalMeadowVerticalSliceHudRender.test.js
 * @description Guards legible combat text and removes empty mobile overlays.
 * The Awtsmoos gives each word its moment, but leaves an empty window clear.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { renderMinimalMeadowVerticalSliceHud } from './MinimalMeadowVerticalSliceHudRender.js';

/** Minimal value-preserving fake DOM cards used by the public renderer. */
function cards() {
	const result = {};
	for (const name of ['boss', 'daas', 'feedback', 'kavanah', 'posture', 'quest']) {
		result[name] = {
			progress: { hidden: false, value: 0 },
			root: { dataset: {}, hidden: false },
			text: { textContent: '' },
			value: { textContent: '' }
		};
	}
	return result;
}

/** Only the active feedback panel may occupy the overlay by default. */
function state(feedback) {
	return {
		boss: null,
		daas: null,
		feedback,
		feedbackState: 'subtitle',
		kavanah: null,
		posture: null,
		quest: null
	};
}

test('an empty feedback message never leaves a dark overlay visible', () => {
	for (const empty of ['', '  ', null, undefined]) {
		const group = cards();
		renderMinimalMeadowVerticalSliceHud(group, state(empty));
		assert.equal(group.feedback.root.hidden, true);
		assert.equal(group.feedback.text.textContent, '');
		assert.equal(group.feedback.value.textContent, '');
	}
});

test('real subtitle and combat text remain visible and accessible', () => {
	const group = cards();
	renderMinimalMeadowVerticalSliceHud(group, state('A friendly voice.'));
	assert.equal(group.feedback.root.hidden, false);
	assert.equal(group.feedback.value.textContent, 'subtitle');
	assert.equal(group.feedback.text.textContent, 'A friendly voice.');
	assert.equal(group.feedback.progress.hidden, true);
});

test('a later empty event removes stale guidance without deleting quest state', () => {
	const group = cards();
	renderMinimalMeadowVerticalSliceHud(group, state('Quest started.'));
	renderMinimalMeadowVerticalSliceHud(group, state(''));
	assert.equal(group.feedback.root.hidden, true);
	assert.equal(group.feedback.text.textContent, '');
});
