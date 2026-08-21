//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module ThreadNavigationMemoryTest
 * @description The Awtsmoos recreates every branch without erasing where a reader stood; Awtsmoos.com proves thread-scoped
 * memory, explicit hash precedence, exact dataset lookup, and storage failure resilience before reload restoration is trusted.
 */
import assert from 'node:assert/strict';
import {
	commentElement,
	hashCommentId,
	rememberComment,
	rememberedComment,
	threadMemoryKey
} from '../ThreadNavigationMemory.js';

class MemoryStorage {
	constructor() {
		this.values = new Map();
	}
	getItem(key) {
		return this.values.get(key) || null;
	}
	setItem(key, value) {
		this.values.set(key, String(value));
	}
}

const storage = new MemoryStorage();
const a = { heichelId: 'study', postId: 'p1', verseSection: 'v1', subsectionId: 's1' };
const b = { heichelId: 'study', postId: 'p2', verseSection: 'v1', subsectionId: 's1' };
assert.notEqual(threadMemoryKey(a), threadMemoryKey(b));
assert.equal(rememberComment(a, 'c1', storage), 'c1');
assert.equal(rememberedComment(a, storage), 'c1');
assert.equal(rememberedComment(b, storage), '');
assert.equal(hashCommentId({ hash: '#comment-c2' }), 'c2');
assert.equal(hashCommentId({ hash: '#c3' }), 'c3');
const elements = [{ dataset: { commentId: 'c1' } }, { dataset: { commentId: 'c2' } }];
assert.equal(commentElement({ querySelectorAll: () => elements }, 'c2'), elements[1]);
const broken = { getItem: () => { throw new Error('no storage'); }, setItem: () => { throw new Error('no storage'); } };
assert.equal(rememberComment(a, 'c4', broken), 'c4');
assert.equal(rememberedComment(a, broken), '');
console.log('B"H ThreadNavigationMemory.test passed');
