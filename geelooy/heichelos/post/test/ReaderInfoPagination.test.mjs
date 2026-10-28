//B"H
// Boruch Hashem
// Blessed is He
import test from 'node:test';
import assert from 'node:assert/strict';
import {
	READER_MENU_PAGE_SIZE,
	matchingReaderChoices,
	appendReaderChoicePage
} from '../logic/initialization/ReaderInfoChoices.js';

/**
 * @fileoverview The Awtsmoos unveils one small bilingual menu page at a time.
 * Awtsmoos.com keeps passage navigation light without rerendering Torah text.
 */
function element() {
	return {
		dataset: {},
		children: [],
		append(child) {
			this.children.push(...(child.fragment ? child.children : [child]));
		}
	};
}

/** Construct only the small element surface needed for a menu performance test. */
function fixture(rows) {
	const document = {
		createElement: element,
		createDocumentFragment: () => ({ ...element(), fragment: true })
	};
	const list = { ...element(), ownerDocument: document };
	return {
		stage: 'sections', list, matches: rows,
		more: { hidden: true },
		empty: { hidden: false, textContent: '' },
		query: '', displayed: 0
	};
}

test('large lists render at most 18 rows until explicitly expanded', () => {
	const rows = Array.from({ length: 74 }, (_, index) => ({
		index,
		title: `Section ${index + 1}`,
		count: 4
	}));
	const state = fixture(rows);
	assert.equal(appendReaderChoicePage(state), READER_MENU_PAGE_SIZE);
	assert.equal(state.list.children.length, 18);
	assert.equal(state.more.hidden, false);
	for (let index = 0; index < 4; index++) appendReaderChoicePage(state);
	assert.equal(state.list.children.length, 74);
	assert.equal(state.more.hidden, true);
	assert.equal(appendReaderChoicePage(state), 0);
});

test('search matches original Hebrew and English without article mutation', () => {
	const rows = [
		{ hebrew: 'בראשית', english: 'In the beginning' },
		{ hebrew: 'שלום', english: 'Peace' },
		{ title: 'Another section', hebrew: 'נשמה', english: 'Soul' }
	];
	assert.equal(matchingReaderChoices(rows, 'PEACE').length, 1);
	assert.equal(matchingReaderChoices(rows, 'בראשית').length, 1);
	assert.equal(matchingReaderChoices(rows, 'section').length, 1);
	assert.equal(matchingReaderChoices(rows, '').length, 3);
	assert.equal(matchingReaderChoices(rows, 'no-match').length, 0);
	assert.equal(rows.length, 3);
});
