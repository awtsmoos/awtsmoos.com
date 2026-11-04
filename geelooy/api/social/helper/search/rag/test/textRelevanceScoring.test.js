// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file textRelevanceScoring.test.js
 * @description
 * Iteration 7 pins the continuous lexical scale: the visitor battery showed
 * a one-word keyword query ("flood") returning a top-5 tied at exactly
 * 100.0% — every whole-word row collected the +8 phrase bonus for a phrase
 * that was only the word itself — and a two-word query ("tzedakah
 * charity") returning rows tied at exactly 42.9% regardless of length or
 * frequency. These fixtures prove the saturation is gone while the floor,
 * the stopword law, and the exact-identity scores stand untouched.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const {
	EXACT_TITLE_SCORE,
	normalize,
	relevance,
	tokens
} = require('../textRelevance.js');

function score(text, query) {
	return relevance({ text }, normalize(query), tokens(query));
}

test('a one-word query no longer saturates every whole-word row at 100%', () => {
	const once = score(
		'flood waters covered the mountains and rose above the hills in the '
		+ 'days of noah when the rains fell for forty days and forty nights '
		+ 'upon the whole earth below',
		'flood'
	);
	assert(once > 0);
	assert(once < 1, `single whole-word match must not saturate, got ${once}`);
});

test('recurrence earns diminishing credit within one-word queries', () => {
	const once = score('flood waters rose over the dry land today', 'flood');
	const fourTimes = score('flood flood flood flood waters rose', 'flood');
	assert(fourTimes > once, `${fourTimes} should outrank ${once}`);
});

test('equal match profiles at different lengths no longer tie', () => {
	const focused = score('flood waters rose over the dry land', 'flood');
	const buried = score(
		`${Array(199).fill('stone').join(' ')} flood`,
		'flood'
	);
	assert(buried > 0);
	assert(buried < focused, `long row ${buried} must dilute below ${focused}`);
});

test('two-word rows separate by focus instead of tying at one shelf', () => {
	const focused = score(
		'tzedakah sustains the poor and charity gladdens the heart of the giver',
		'tzedakah charity'
	);
	const buried = score(
		`tzedakah ${Array(400).fill('stone').join(' ')} charity`,
		'tzedakah charity'
	);
	assert(focused > 0 && buried > 0);
	assert(buried < focused, `encyclopedic row ${buried} must rank below ${focused}`);
	assert.notEqual(buried, 6 / 14, 'the old flat 42.9% shelf is gone');
});

test('the relevance floor and stopword law are unchanged', () => {
	assert.equal(score('the and of the', 'flood'), 0);
	assert.equal(relevance({ text: 'the flood' }, normalize('the'), tokens('the')), 0);
	assert.equal(
		relevance(
			{ title: 'Flood' },
			normalize('Flood'),
			tokens('Flood')
		),
		EXACT_TITLE_SCORE
	);
});

test('Hebrew lexical relevance still answers', () => {
	assert(score('מבול בא על הארץ בימי נח', 'מבול') > 0);
});
