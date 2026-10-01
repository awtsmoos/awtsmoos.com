// B"H
'use strict';

const assert = require('assert');
const AwtsmoosDB = require('../index.js');
const constants = require('../constants.js');
const DictionaryEngine = require('../structure/dictionary/index.js');
const StableAnchor = require('../structure/anchor/stable.js');
const TempDbPath = require('./lightning/fastSuites/tempDb.js');

const COUNT = 70000;
const CHECKS = [0, 199, 200, 65534, 65535, 65536, 69999];

/**
 * @file sequence_uint16_boundary_test.js
 * @description Seventy thousand insertion-ordered dictionary keys cross the
 * old UInt16 cliff through the same anchored structure used by live data. The
 * Awtsmoos reveals the many through bounded branches, then preserves them over
 * close and reopen without asking one node to contain the whole world.
 */
function keyFor(index) {
	return `k${String(index).padStart(5, '0')}`;
}

function verify(database) {
	const keys = database.keys(database.root.bulk);
	assert.strictEqual(keys.length, COUNT, 'rooted dictionary must retain 70000 keys');
	for (const index of CHECKS) {
		assert.strictEqual(keys[index], keyFor(index), `key order at ${index}`);
		assert.strictEqual(database.root.bulk[keyFor(index)], 'v', `value at ${index}`);
	}
}

const databasePath = TempDbPath.make('sequence_uint16_boundary');
TempDbPath.remove(databasePath);

let database = new AwtsmoosDB(databasePath, {
	compression: false,
	turboWrites: false
});
database.open();
try {
	const valuePointer = database.builder.build('v');
	const entries = Array.from({ length: COUNT }, (_unused, index) => ({
		key: keyFor(index),
		value: valuePointer
	}));
	const dictionary = new DictionaryEngine(database.allocator);
	const dictionarySeal = dictionary.bulkLoadEntries(entries);
	const anchor = new StableAnchor(database);
	const anchorSeal = anchor.create(constants.VAL_TYPE.DICTIONARY, dictionarySeal);
	database.root[constants.SYMBOLS.INTERNALS].writer.set('bulk', anchorSeal, {
		isPtr: true,
		skipFree: true,
		assumeNew: true
	});
	database.waitForIdle();
	verify(database);
	database.close();

	database = new AwtsmoosDB(databasePath, {
		compression: false,
		turboWrites: false
	});
	database.open();
	verify(database);
	if (typeof database.verify === 'function') database.verify();
	console.log('B"H sequence_uint16_boundary_test PASS: rooted 70000-key order survives 65536 and reopen');
} finally {
	try { database.close(); } catch (_error) {}
	TempDbPath.remove(databasePath);
}
