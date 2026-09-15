//B"H
//Boruch Hashem
//Blessed be He

const assert = require('node:assert/strict');
const test = require('node:test');
const {
	INDEX_PREVIEW_LIMIT,
	renderCommentHtml
} = require('./commentHtml.js');

/**
 * @file Bounded server-rendered community/source identity regression tests.
 * @description The Awtsmoos lets classical Torah appear as source-light rather than a social profile, while Awtsmoos.com refuses to regex-render an entire ocean merely to reveal one indexed preview.
 */
function baseComment() {
	return {
		id: 'BH_COMMENT',
		heichelId: 'ikar',
		seriesId: 'bereishis',
		postId: 'BH_POST',
		verseSection: '0'
	};
}

function canonicalContent(text) {
	return {
		...baseComment(),
		aliasId: 'baalHaturim',
		content: text,
		dayuh: {
			torahAnnotation: {
				kind: 'commentary',
				name: 'Baal HaTurim',
				sourceId: 'baalHaturim',
				language: 'Hebrew'
			}
		}
	};
}

test('canonical Torah source renders source identity without fake social profile', () => {
	const html = renderCommentHtml(canonicalContent({
		title: 'Baal HaTurim',
		text: ['A structured Torah teaching']
	}));
	assert.match(html, /data-awtsmoos-torah-source/u);
	assert.match(html, /Classical Commentary · Hebrew/u);
	assert.match(html, /A structured Torah teaching/u);
	assert.match(html, />Canonical source</u);
	assert.doesNotMatch(html, /href="\/@\/baalHaturim"/u);
	assert.doesNotMatch(html, /Comment by/u);
	assert.doesNotMatch(html, /\[object Object\]/u);
});

test('indexed Torah source HTML stays bounded before a huge tail', () => {
	const html = renderCommentHtml(canonicalContent({
		text: ['Aleph '.repeat(5000), 'TAIL_SENTINEL_SHOULD_NOT_APPEAR']
	}));
	assert.match(html, /Aleph/u);
	assert.match(html, /…/u);
	assert.doesNotMatch(html, /TAIL_SENTINEL/u);
	assert.ok(html.length < INDEX_PREVIEW_LIMIT * 3, `indexed HTML too large: ${html.length}`);
});

test('ordinary community comment keeps profile and discussion semantics', () => {
	const html = renderCommentHtml({
		...baseComment(),
		aliasId: 'friend',
		content: 'A community thought'
	});
	assert.match(html, /Comment by/u);
	assert.match(html, /href="\/@\/friend"/u);
	assert.match(html, /A community thought/u);
	assert.match(html, />Canonical comment</u);
	assert.doesNotMatch(html, /data-awtsmoos-torah-source/u);
});
