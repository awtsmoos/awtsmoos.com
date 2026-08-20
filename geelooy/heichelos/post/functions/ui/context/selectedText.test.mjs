// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file selectedText.test.mjs
 * @description
 * The Awtsmoos tests that ordinary reader highlighting becomes one bounded, language-aware search vessel;
 * Awtsmoos.com recognizes English comments, Hebrew source text, mixed phrases, normalized whitespace, and safe source anchors.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	MAX_RELATED_QUERY_LENGTH,
	selectedReaderText,
	selectedTextLanguage
} from './selectedText.js';

function fakeSelection(text, { comment = false } = {}) {
	const root = {
		id: comment ? 'comment-root' : 'post-root',
		matches(selector) {
			return comment && selector.includes('.comment-content');
		}
	};
	const coordinate = { id: 'coordinate-root' };
	const element = {
		closest(selector) {
			if (selector.includes('#realPost')) return root;
			if (selector === '[data-awtsmoos-idx]') return coordinate;
			return null;
		}
	};
	return {
		isCollapsed: false,
		rangeCount: 1,
		anchorNode: { nodeType: 3, parentElement: element },
		toString() {
			return text;
		}
	};
}

test('language classifier recognizes English Hebrew and mixed selections', () => {
	assert.equal(selectedTextLanguage('divine purpose'), 'english');
	assert.equal(selectedTextLanguage('אמר שלום'), 'hebrew');
	assert.equal(selectedTextLanguage('אמר purpose'), 'mixed');
});

test('English comment selection normalizes whitespace and anchors to comment root', () => {
	const result = selectedReaderText(fakeSelection('  divine   purpose\n revealed ', {
		comment: true
	}));
	assert.equal(result.text, 'divine purpose revealed');
	assert.equal(result.language, 'english');
	assert.equal(result.origin, 'comment-selection');
	assert.equal(result.anchor.id, 'comment-root');
});

test('post selection is capped and anchors to the reader coordinate', () => {
	const result = selectedReaderText(fakeSelection('א'.repeat(900)));
	assert.equal(result.text.length, MAX_RELATED_QUERY_LENGTH);
	assert.equal(result.language, 'hebrew');
	assert.equal(result.origin, 'post-selection');
	assert.equal(result.anchor.id, 'coordinate-root');
});
