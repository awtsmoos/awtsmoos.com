// B"H
// Boruch Hashem
// Blessed is He

/** @file initDbRoot.test.js @description Proves explicit DosDB root selection. */

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const {
	initDb,
	resolveDbPath
} = require('../../../ayzarim/awtsmoosDynamicServer/server/initDb.js');

function dependencies() {
	class FakeDosDB {
		constructor(root) {
			this.root = root;
			this.initialized = false;
		}

		async init() {
			this.initialized = true;
		}
	}
	return {
		config: { dbPath: '../configured' },
		DosDB: FakeDosDB,
		path
	};
}

test('AWTSMOOS_DB_ROOT wins over repository configuration', () => {
	const deps = dependencies();
	const resolved = resolveDbPath(deps, '/server', {
		AWTSMOOS_DB_ROOT: '/explicit/dayuh'
	});
	assert.equal(resolved, path.resolve('/explicit/dayuh'));
});

test('AWTS_DB_ROOT remains a supported compatibility alias', () => {
	const deps = dependencies();
	const resolved = resolveDbPath(deps, '/server', {
		AWTS_DB_ROOT: '/compatibility/dayuh'
	});
	assert.equal(resolved, path.resolve('/compatibility/dayuh'));
});

test('initDb constructs and initializes DosDB at the explicit root', async () => {
	const database = await initDb(dependencies(), '/server', {
		AWTSMOOS_DB_ROOT: '/fixture/dayuh'
	});
	assert.equal(database.root, path.resolve('/fixture/dayuh'));
	assert.equal(database.initialized, true);
	assert.equal(process.awtsmoosDbPath, path.resolve('/fixture/dayuh'));
});
