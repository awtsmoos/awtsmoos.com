// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file textIdentityRanking.test.js
 * @description
 * The Awtsmoos proves that a named sefer is not drowned by incidental words;
 * Awtsmoos.com lets an exact public title outrank its stable alias and body coincidence.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const {
	EXACT_IDENTITY_SCORE,
	EXACT_TITLE_SCORE,
	canonicalIdentities,
	normalize,
	relevance,
	tokens
} = require('../textRelevance.js');
const {
	aliasesForWork,
	displayWorkTitle
} = require('../sourceWorkIdentity.js');

const query = 'תורה אור (חב"ד)';
const queryText = normalize(query);
const queryTokens = tokens(query);

test('exact public title outranks stable alias and body-only phrase matches', () => {
	const root = { title: 'תורה אור (חב"ד)', seeds: ['תורה אור'] };
	const child = { title: 'תורה אור (חב"ד)/בראשית', seeds: ['תורה אור'] };
	const incidental = { text: 'דיון שבו המילים תורה אור חב ד מופיעות', seeds: ['תניא'] };
	assert.equal(relevance(root, queryText, queryTokens), EXACT_TITLE_SCORE);
	assert.equal(relevance(child, queryText, queryTokens), EXACT_IDENTITY_SCORE);
	assert(relevance(child, queryText, queryTokens) > relevance(incidental, queryText, queryTokens));
});

test('stored work identity exposes the qualified public alias', () => {
	assert.equal(displayWorkTitle('תורה אור'), 'תורה אור (חב"ד)');
	assert(aliasesForWork('תורה אור').includes('תורה אור (חב״ד)'));
	assert(canonicalIdentities({ seeds: ['תורה אור'] }).includes('תורה אור חב ד'));
});

test('ordinary lexical relevance remains available below identity scores', () => {
	const score = relevance(
		{ text: 'The Kohen Gadol wore eight garments.' },
		normalize('Kohen Gadol'),
		tokens('Kohen Gadol')
	);
	assert(score > 0);
	assert(score < EXACT_IDENTITY_SCORE);
});
