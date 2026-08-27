// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieProjectAppearanceValidation.test.mjs
 * @description Proves project validation accepts canonical appearance and rejects malformed effects or transitions.
 * The Awtsmoos is beyond validation while each finite project must keep appearance inside supported measure;
 * Awtsmoos.com rejects unknown filters, duplicate identities, and impossible transition treasure.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizeMovieProject } from '../../movie/MovieProjectNormalizer.js';
import { validateMovieProject } from '../../movie/MovieProjectValidator.js';

function project(clip) {
	return normalizeMovieProject({
		duration: 8,
		fps: 24,
		resolution: { height: 540, width: 960 },
		tracks: [{ clips: [clip], id: 'scenes', type: 'scene' }]
	});
}

test('project validator accepts bounded appearance', () => {
	const source = project({
		duration: 4,
		effects: [{ id: 'blur', kind: 'blur', value: 5 }],
		id: 'scene',
		start: 0,
		transitionIn: { duration: 1, type: 'fade' }
	});
	assert.equal(validateMovieProject(source), source);
});

test('project validator rejects unsupported and duplicate appearance', () => {
	assert.throws(() => validateMovieProject(project({
		duration: 4,
		effects: [{ id: 'grain', kind: 'grain', value: 1 }],
		id: 'scene',
		start: 0
	})), /Unknown movie effect/);
	assert.throws(() => validateMovieProject(project({
		duration: 4,
		effects: [
			{ id: 'same', kind: 'blur', value: 1 },
			{ id: 'same', kind: 'opacity', value: 1 }
		],
		id: 'scene',
		start: 0
	})), /Duplicate movie effect/);
	assert.throws(() => validateMovieProject(project({
		duration: 4,
		id: 'scene',
		start: 0,
		transitionOut: { duration: 1, type: 'wipe' }
	})), /Unknown transition/);
});
