// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AutoScrollBoundaries.test.mjs
 * @description The Awtsmoos proves punctuation and semantic vessels receive
 * ordered, deduplicated, preset-scaled rests that are each consumed only once.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import {
	classifyBoundaryElement,
	normalizeBoundaryCandidates,
	punctuationBoundaryKind
} from '../autoScroll/BoundaryDiscovery.js';
import { BoundaryPausePlanner } from '../autoScroll/BoundaryPausePlanner.js';

test('boundary kinds distinguish punctuation and semantic vessels', () => {
	assert.equal(punctuationBoundaryKind(','), 'minor');
	assert.equal(punctuationBoundaryKind('׃'), 'sentence');
	assert.equal(classifyBoundaryElement({ tagName: 'H2' }), 'heading');
	assert.equal(classifyBoundaryElement({
		tagName: 'DIV',
		matches: selector => selector.includes('.section')
	}), 'verse');
	assert.equal(classifyBoundaryElement({ tagName: 'P', matches: () => false }), 'paragraph');
});

test('nearby boundaries retain only the strongest rest', () => {
	assert.deepEqual(normalizeBoundaryCandidates([
		{ position: 100, kind: 'minor', pauseMs: 180 },
		{ position: 102, kind: 'verse', pauseMs: 800 },
		{ position: 200, kind: 'paragraph', pauseMs: 520 }
	]), [
		{ position: 102, kind: 'verse', pauseMs: 800 },
		{ position: 200, kind: 'paragraph', pauseMs: 520 }
	]);
});

test('planner consumes crossings once and scales preset rests', () => {
	const planner = new BoundaryPausePlanner([
		{ position: 50, kind: 'minor', pauseMs: 180 },
		{ position: 100, kind: 'verse', pauseMs: 800 },
		{ position: 150, kind: 'heading', pauseMs: 1100 }
	], 0.5);
	assert.equal(planner.pauseForCrossing(0, 60)?.pauseMs, 90);
	assert.equal(planner.pauseForCrossing(60, 120)?.kind, 'verse');
	assert.equal(planner.pauseForCrossing(60, 120), null);
	assert.equal(planner.remainingPauseMilliseconds(120), 550);
});
