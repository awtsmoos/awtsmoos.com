//B"H
// Boruch Hashem
// Blessed is He
import test from 'node:test';
import assert from 'node:assert/strict';
import { clearReaderPairSelection, selectReaderPair } from '../logic/initialization/ReaderSectionHighlight.js';

/**
 * @fileoverview Hermetic Hebrew/English pair-selection regression tests.
 * The Awtsmoos holds both tongues within a single stable beam;
 * a reader's chosen light shall never tear or displace the dream.
 */
class FakeElement {
	constructor(classes = [], parent = null) {
		this.classes = new Set(classes);
		this.parent = parent;
		this.classList = {
			add: value => this.classes.add(value),
			remove: value => this.classes.delete(value),
			contains: value => this.classes.has(value)
		};
	}

	closest(selector) {
		const selectors = selector.split(',').map(value => value.trim());
		let current = this;
		while (current) {
			if (selectors.some(value => value.startsWith('.') && current.classes.has(value.slice(1)))) {
				return current;
			}
			if (selectors.some(value => !value.startsWith('.') && current.classes.has(value))) {
				return current;
			}
			current = current.parent;
		}
		return null;
	}

	contains(element) {
		let current = element;
		while (current) {
			if (current === this) return true;
			current = current.parent;
		}
		return false;
	}
}

function fixture() {
	const root = new FakeElement(['reader']);
	const pairOne = new FakeElement(['meluket-phrase-pair'], root);
	const hebrew = new FakeElement(['meluket-phrase--he'], pairOne);
	const english = new FakeElement(['meluket-phrase--en'], pairOne);
	const hebrewText = new FakeElement(['text'], hebrew);
	const englishText = new FakeElement(['text'], english);
	const pairTwo = new FakeElement(['meluket-phrase-pair'], root);
	const nextHebrew = new FakeElement(['meluket-phrase--he'], pairTwo);
	const link = new FakeElement(['a'], english);
	const outside = new FakeElement(['meluket-phrase--en']);
	return { root, pairOne, pairTwo, hebrew, english, hebrewText, englishText, nextHebrew, link, outside };
}

test('either language selects the exact same bilingual parent without rebuilding text', () => {
	clearReaderPairSelection();
	const f = fixture();
	const before = [f.hebrewText, f.englishText];
	assert.equal(selectReaderPair(f.hebrewText, f.root), f.pairOne);
	assert.equal(selectReaderPair(f.englishText, f.root), f.pairOne);
	assert.ok(f.pairOne.classList.contains('is-pair-selected'));
	assert.equal(f.hebrewText, before[0]);
	assert.equal(f.englishText, before[1]);
	assert.equal(selectReaderPair(f.nextHebrew, f.root), f.pairTwo);
	assert.equal(f.pairOne.classList.contains('is-pair-selected'), false);
	assert.equal(f.pairTwo.classList.contains('is-pair-selected'), true);
	clearReaderPairSelection();
});

test('links, outside selections, and unpaired content do not alter selection', () => {
	clearReaderPairSelection();
	const f = fixture();
	selectReaderPair(f.hebrewText, f.root);
	assert.equal(selectReaderPair(f.link, f.root), null);
	assert.equal(selectReaderPair(f.outside, f.root), null);
	assert.equal(selectReaderPair(f.pairTwo, f.root), null);
	assert.equal(f.pairOne.classList.contains('is-pair-selected'), true);
	clearReaderPairSelection();
	assert.equal(f.pairOne.classList.contains('is-pair-selected'), false);
});
