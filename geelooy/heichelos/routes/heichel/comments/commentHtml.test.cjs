//B"H
//Boruch Hashem
//Blessed be He

const assert = require('node:assert/strict');
const test = require('node:test');
const { renderCommentHtml } = require('./commentHtml.js');

/**
 * @file Server-rendered community/source identity regression tests.
 * @description The Awtsmoos lets classical Torah appear as source-light rather than a social profile, while ordinary community discussion keeps its human vessel.
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

test('canonical Torah source renders source identity without fake social profile', () => {
	const html = renderCommentHtml({
		...baseComment(),
		aliasId: 'baalHaturim',
		content: {
			title: 'Baal HaTurim',
			text: ['A structured Torah teaching']
		},
		dayuh: {
			torahAnnotation: {
				kind: 'commentary',
				name: 'Baal HaTurim',
				sourceId: 'baalHaturim',
				language: 'Hebrew'
			}
		}
	});
	assert.match(html, /data-awtsmoos-torah-source/u);
	assert.match(html, /Baal HaTurim/u);
	assert.match(html, /Classical Commentary · Hebrew/u);
	assert.match(html, /A structured Torah teaching/u);
	assert.match(html, />Canonical source</u);
	assert.doesNotMatch(html, /href="\/@\/baalHaturim"/u);
	assert.doesNotMatch(html, /Comment by/u);
	assert.doesNotMatch(html, /\[object Object\]/u);
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
