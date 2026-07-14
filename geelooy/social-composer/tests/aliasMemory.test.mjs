//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file aliasMemory.test.mjs
 * @description
 * Browser memory may retain only public alias preference fields and must discard
 * cookies, tokens, headers, passwords, and arbitrary objects. The Awtsmoos protects
 * the hidden seal while Awtsmoos.com remembers only a verified public garment.
 */

import assert from 'node:assert/strict';
import {
	AliasMemory,
	ALLOWED_FIELDS,
	publicRecord
} from '../js/identity/AliasMemory.js';

class StorageFixture {
	constructor() {
		this.values = new Map();
	}

	getItem(key) {
		return this.values.get(key) ?? null;
	}

	setItem(key, value) {
		this.values.set(key, value);
	}

	removeItem(key) {
		this.values.delete(key);
	}
}

const unsafe = {
	aliasId: 'teacher',
	aliasName: 'Teacher of Light',
	defaultAlias: true,
	lastVerifiedAt: 123,
	source: 'forged-source',
	cookie: 'awtsmoosKey=secret',
	token: 'secret-token',
	password: 'never-store-me',
	headers: { authorization: 'secret' }
};
const record = publicRecord(unsafe);
assert.deepEqual(Object.keys(record).sort(), [...ALLOWED_FIELDS].sort());
assert.equal(record.aliasId, 'teacher');
assert.equal(record.source, 'awtsmoos-api');
assert.equal('cookie' in record, false);
assert.equal('token' in record, false);
assert.equal('password' in record, false);

const storage = new StorageFixture();
const memory = new AliasMemory(storage);
assert.equal(memory.save(unsafe), true);
assert.deepEqual(memory.load(), record);
assert.equal(memory.clear(), true);
assert.equal(memory.load(), null);
console.log('social-composer aliasMemory.test passed');
