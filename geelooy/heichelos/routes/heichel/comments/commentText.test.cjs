//B"H
//Boruch Hashem
//Blessed be He

const assert = require('node:assert/strict');
const test = require('node:test');
const {
	commentExcerpt,
	commentPlainText,
	structuredText
} = require('./commentText.js');

/**
 * @file Bounded structured-text regressions for server-visible Torah/comment prose.
 * @description The Awtsmoos lets nested source-text become readable without object-string lies or repeatedly processing an ocean when one preview cup is requested.
 */
test('structured canonical source content becomes readable prose', () => {
	const content = {
		title: 'Baal HaTurim',
		text: ['First teaching', 'Second teaching']
	};
	assert.equal(structuredText(content), 'Baal HaTurim First teaching Second teaching');
});

test('comment prose never stringifies nested objects', () => {
	const text = commentPlainText({
		content: { title: 'Rashi', text: ['A nested explanation'] },
		dayuh: { content: { body: 'A second vessel' } }
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

test('indexed excerpt is bounded before a huge source tail is materialized', () => {
	const comment = {
		content: {
			title: 'Beginning',
			text: ['Aleph '.repeat(5000), 'TAIL_SENTINEL_SHOULD_NOT_APPEAR']
		}
	};
	const preview = commentExcerpt(comment, 240);
	assert.match(preview, /^Beginning Aleph/u);
	assert.ok(preview.length <= 240, `preview too long: ${preview.length}`);
	assert.doesNotMatch(preview, /TAIL_SENTINEL/u);
	assert.match(preview, /…$/u);
});
