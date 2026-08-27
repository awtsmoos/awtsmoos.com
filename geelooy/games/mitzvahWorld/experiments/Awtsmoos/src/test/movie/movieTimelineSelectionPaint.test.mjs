// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieTimelineSelectionPaint.test.mjs
 * @description Proves mobile replacement, desktop modifier intent, selected-many paint, and primary ARIA state.
 * The Awtsmoos renews touch, key, and pointer through one source; Awtsmoos.com verifies
 * every visible clip tells the same selection truth through class, count, pressed, and current states.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	movieTimelineSelectionMode,
	paintMovieTimelineSelection
} from '../../movie/MovieTimelineSelectionPaint.js';

function clip(trackId, clipId) {
	const classes = new Set();
	const attributes = new Map();
	return {
		attributes,
		classList: {
			contains: value => classes.has(value),
			toggle(value, enabled) {
				if (enabled) classes.add(value);
				else classes.delete(value);
			}
		},
		dataset: { clipId, trackId },
		removeAttribute: name => attributes.delete(name),
		setAttribute: (name, value) => attributes.set(name, value)
	};
}

test('modifier intent keeps touch/plain replace and desktop add/toggle semantics', () => {
	assert.equal(movieTimelineSelectionMode({}), 'replace');
	assert.equal(movieTimelineSelectionMode({ shiftKey: true }), 'add');
	assert.equal(movieTimelineSelectionMode({ ctrlKey: true }), 'toggle');
	assert.equal(movieTimelineSelectionMode({ metaKey: true }), 'toggle');
	assert.equal(
		movieTimelineSelectionMode({ ctrlKey: true, shiftKey: true }),
		'toggle'
	);
});

test('painter marks all selected clips and one primary clip accessibly', () => {
	const one = clip('track', 'one');
	const two = clip('track', 'two');
	const three = clip('track', 'three');
	const shell = {
		dataset: {},
		querySelectorAll: () => [one, two, three]
	};
	paintMovieTimelineSelection(shell, {
		items: [
			{ clipId: 'one', trackId: 'track' },
			{ clipId: 'two', trackId: 'track' }
		],
		primary: { clipId: 'two', trackId: 'track' },
		range: null
	});
	assert.equal(shell.dataset.selectionCount, '2');
	assert.equal(one.classList.contains('is-selected'), true);
	assert.equal(one.classList.contains('is-primary-selected'), false);
	assert.equal(one.attributes.get('aria-pressed'), 'true');
	assert.equal(one.attributes.has('aria-current'), false);
	assert.equal(two.classList.contains('is-primary-selected'), true);
	assert.equal(two.attributes.get('aria-current'), 'true');
	assert.equal(three.classList.contains('is-selected'), false);
	assert.equal(three.attributes.get('aria-pressed'), 'false');
});

test('repainting removes stale selected and primary states', () => {
	const element = clip('track', 'one');
	const shell = { dataset: {}, querySelectorAll: () => [element] };
	paintMovieTimelineSelection(shell, {
		items: [{ clipId: 'one', trackId: 'track' }],
		primary: { clipId: 'one', trackId: 'track' },
		range: null
	});
	paintMovieTimelineSelection(shell, null);
	assert.equal(element.classList.contains('is-selected'), false);
	assert.equal(element.classList.contains('is-primary-selected'), false);
	assert.equal(element.attributes.get('aria-pressed'), 'false');
	assert.equal(element.attributes.has('aria-current'), false);
});
