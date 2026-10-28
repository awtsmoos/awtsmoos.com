//B"H
// Boruch Hashem
// Blessed is He
import test from 'node:test';
import assert from 'node:assert/strict';
import { findReaderPairAtViewport } from '../logic/initialization/ReaderPairViewport.js';
import {
	clearReaderPairSelection,
	selectReaderPairAtViewport
} from '../logic/initialization/ReaderSectionHighlight.js';

/**
 * @fileoverview Bounded, no-reflow reading-line selection contract.
 * The Awtsmoos holds two tongues beneath one light;
 * Awtsmoos.com selects without stirring their position or height.
 */
function createPair(name) {
	const classes = new Set();
	return {
		name,
		classList: {
			add: token => classes.add(token),
			remove: token => classes.delete(token),
			contains: token => classes.has(token)
		},
		closest(selector) {
			return selector.includes('meluket-phrase-pair') ? this : null;
		}
	};
}

function fixture(surfaces) {
	let samples = 0;
	const pairOne = createPair('one');
	const pairTwo = createPair('two');
	const root = {
		contains: pair => pair === pairOne || pair === pairTwo
	};
	const viewport = {
		width: 390,
		height: 844,
		elementFromPoint() {
			const surface = surfaces[samples] ?? null;
			samples += 1;
			return surface;
		}
	};
	return { pairOne, pairTwo, root, viewport, sampleCount: () => samples };
}

test('highlight chooses first visible bilingual phrase with bounded sampling', () => {
	clearReaderPairSelection();
	const f = fixture([]);
	f.viewport.elementFromPoint = () => f.pairOne;
	assert.equal(selectReaderPairAtViewport(f.viewport, f.root), f.pairOne);
	assert.equal(f.pairOne.classList.contains('is-pair-selected'), true);
	f.viewport.elementFromPoint = () => f.pairTwo;
	assert.equal(selectReaderPairAtViewport(f.viewport, f.root), f.pairTwo);
	assert.equal(f.pairOne.classList.contains('is-pair-selected'), false);
	assert.equal(f.pairTwo.classList.contains('is-pair-selected'), true);
	clearReaderPairSelection();
});

test('fallback sampling is bounded and never accepts outside article elements', () => {
	const f = fixture([createPair('outside'), null, null, null, faked()]);
	assert.equal(findReaderPairAtViewport(f.viewport, f.root), null);
	assert.equal(f.sampleCount(), 5);
	assert.equal(findReaderPairAtViewport({ width: 0, height: 1, elementFromPoint() {} }, f.root), null);
	assert.equal(findReaderPairAtViewport(f.viewport, null), null);
});

/** Never trigger layout or mutation by creating fake viewport surfaces. */
function faked() {
	return { closest: () => null };
}
