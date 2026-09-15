//B"H
//Boruch Hashem
//Blessed be He

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	executedSearchLabel,
	hasHebrewScript,
	searchStatusMessage
} from './searchExecutionLabel.js';

/**
 * @file Search execution-label truthfulness tests.
 * @description The Awtsmoos lets Awtsmoos.com tell seekers whether Torah was found lexically or semantically without overstating exactness.
 */
test('Hebrew, Aramaic, Yiddish, and mixed-script queries stay Hebrew-script lexical', () => {
	for (const query of ['בראשית', 'גמרא', 'ייִדיש', 'creation בראשית']) {
		assert.equal(hasHebrewScript(query), true, query);
		assert.equal(executedSearchLabel({ mode: 'vector' }, query), 'Hebrew-script lexical', query);
	}
});

test('English executed modes distinguish literal text from semantic meaning', () => {
	assert.equal(executedSearchLabel({ mode: 'text' }, 'creation'), 'English text');
	assert.equal(executedSearchLabel({ mode: 'vector' }, 'creation'), 'English semantic');
	assert.equal(executedSearchLabel({}, 'creation'), 'Library search');
});

test('status message reports executed lane and linked-comment availability', () => {
	const hits = [{ comments: [{ id: 'one' }] }, { comments: [] }];
	assert.equal(
		searchStatusMessage({ mode: 'text' }, hits, 'בראשית'),
		'2 sources found · Hebrew-script lexical · 1 linked comment available · The first source window is open.'
	);
	assert.equal(
		searchStatusMessage({ mode: 'vector' }, [], 'creation'),
		'0 sources found · English semantic · 0 linked comments available'
	);
});
