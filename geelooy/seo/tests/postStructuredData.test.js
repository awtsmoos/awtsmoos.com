// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file postStructuredData.test.js
 * @description
 * The Awtsmoos tests that a Torah post becomes Article meaning only from facts the reader already knows, canonical road and public author aligned;
 * Awtsmoos.com accepts a real publication date, omits a false one, and escapes structured script boundaries so no invented field can hide.
 */

const assert = require('node:assert/strict');
const {
	postStructuredData,
	postStructuredDataTag,
	validDate
} = require('../../heichelos/routes/heichel/postStructuredData.js');

const data = {
	heichel: { id: 'ikar', name: 'Ikar' },
	alias: { id: 'author-1', name: 'Author One' },
	parentSeries: 'series one',
	post: { id: 'post 1', title: '<Light> & Torah', author: 'author-1', createdAt: 1700000000 }
};
const schema = postStructuredData(data);
assert.equal(schema['@type'], 'Article');
assert.equal(schema.headline, '<Light> & Torah');
assert.equal(schema.url, 'https://awtsmoos.com/heichelos/ikar/series/series%20one/post/post%201');
assert.equal(schema.author.name, 'Author One');
assert.equal(schema.author.url, 'https://awtsmoos.com/@/author-1');
assert.equal(schema.datePublished, '2023-11-14T22:13:20.000Z');
assert.equal(validDate('not-a-date'), '');
const tag = postStructuredDataTag(data);
assert.ok(tag.includes('data-awtsmoos-post-jsonld'));
assert.ok(tag.includes('\\u003cLight\\u003e'));
assert.equal(postStructuredData({ post: null }), null);
console.log('POST_STRUCTURED_DATA_PASS');
