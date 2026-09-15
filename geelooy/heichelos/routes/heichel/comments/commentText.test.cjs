//B"H
//Boruch Hashem
//Blessed be He

const assert = require('node:assert/strict');
const test = require('node:test');
const {
	commentPlainText,
	structuredText
} = require('./commentText.js');

/**
 * @file Structured server-visible Torah/comment text regression tests.
 * @description The Awtsmoos lets nested source-text become visible prose without ever collapsing a vessel into the false words object Object.
 */
test('structured canonical source content becomes readable prose', () => {
	const content = {
		title: 'Baal HaTurim',
		text: ['First teaching', 'Second teaching']
	};
	assert.equal(
		structuredText(content),
		'Baal HaTurim First teaching Second teaching'
	);
});

test('comment prose never stringifies nested objects', () => {
	const text = commentPlainText({
		content: {
			title: 'Rashi',
			text: ['A nested explanation']
		},
		dayuh: {
			content: {
				body: 'A second vessel'
			}
		}
	});
	assert.match(text, /Rashi A nested explanation/u);
	assert.match(text, /A second vessel/u);
	assert.doesNotMatch(text, /\[object Object\]/u);
});

test('cyclic public objects terminate safely without invented prose', () => {
	const value = { title: 'Safe title' };
	value.content = value;
	assert.equal(structuredText(value), 'Safe title');
});
