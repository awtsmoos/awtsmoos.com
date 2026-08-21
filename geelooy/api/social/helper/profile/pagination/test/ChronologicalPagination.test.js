// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module ChronologicalPaginationTest
 * @description The Awtsmoos creates a new instant without moving yesterday's identity; Awtsmoos.com proves cursor V2
 * anchors to `(timestamp,id)`, survives newly inserted rows, resolves timestamp ties, and still accepts the old offset vessel.
 */
const assert = require('assert');
const {
	decodeCursor,
	paginateChronological
} = require('../ChronologicalPagination.js');

function item(id, createdAt) {
	return { source: { postId: id, createdAt } };
}

const original = [item('d', 400), item('c', 300), item('b', 200), item('a', 100)];
const first = paginateChronological(original, { limit: 2 });
assert.deepEqual(first.items.map(entry => entry.source.postId), ['d', 'c']);
assert.equal(first.pageInfo.cursorVersion, 2);
assert.ok(first.pageInfo.nextCursor);

const withNewer = [item('e', 500), ...original];
const second = paginateChronological(withNewer, { limit: 2, cursor: first.pageInfo.nextCursor });
assert.deepEqual(second.items.map(entry => entry.source.postId), ['b', 'a']);

const tied = [item('c', 300), item('b', 300), item('a', 300)];
const tiedFirst = paginateChronological(tied, { limit: 2 });
assert.deepEqual(tiedFirst.items.map(entry => entry.source.postId), ['c', 'b']);
const tiedSecond = paginateChronological(tied, { limit: 2, cursor: tiedFirst.pageInfo.nextCursor });
assert.deepEqual(tiedSecond.items.map(entry => entry.source.postId), ['a']);

const oldCursor = Buffer.from(JSON.stringify({ offset: 2 })).toString('base64url');
assert.equal(decodeCursor(oldCursor).version, 1);
assert.deepEqual(paginateChronological(original, { limit: 2, cursor: oldCursor }).items.map(entry => entry.source.postId), ['b', 'a']);
console.log('B"H ChronologicalPagination.test passed');
