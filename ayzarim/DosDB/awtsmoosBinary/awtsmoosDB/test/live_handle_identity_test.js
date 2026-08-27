// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file test/live_handle_identity_test.js
 * @chapter Many Windows Continue To See One Moving Structure
 * @description
 * Alternates mutations through sibling handles to one map and anchored list,
 * then proves recursive hydration keeps neighboring Map and Set vessels distinct.
 * The Awtsmoos reveals one canonical lineage only where parent and key are real;
 * transient circular caches may never merge unrelated structures.
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const AwtsmoosDB = require('../index.js');

function assert(condition, message) {
	if (!condition) throw new Error(message);
}

const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'awtsmoos-handle-identity-'));
const databasePath = path.join(directory, 'identity.awtsdb');
let database;

try {
	database = new AwtsmoosDB(databasePath, {
		compression: false,
		reuseFreedSpace: 'verified'
	});
	database.open();
	database.root.shared = new database.Map();
	database.createList(database.root, 'records');
	database.root.mixed = {
		map: new Map([['first', 1], ['second', 2]]),
		set: new Set(['aleph', 'beis'])
	};

	const mapA = database.root.shared;
	const mapB = database.root.shared;
	const listA = database.root.records;
	const listB = database.root.records;

	for (let index = 0; index < 260; index++) {
		const target = index % 2 === 0 ? mapA : mapB;
		target.set(`key-${String(index).padStart(3, '0')}`, { index, square: index * index });
		if (index % 40 === 0) database.waitForIdle();
	}
	for (let index = 0; index < 80; index++) {
		const target = index % 2 === 0 ? listA : listB;
		target.push({ id: index, value: `record-${index}` });
	}
	listA.label = 'shared-list';
	listB.settings = { dimensions: 16, metric: 'cosine' };
	database.waitForIdle();

	const mixed = database.root.mixed.__resolve__();
	assert(mixed.map instanceof Map, 'hydrated map lost its Map identity');
	assert(mixed.set instanceof Set, 'hydrated set was unified with another structure');
	assert(mixed.map.get('second') === 2, 'hydrated map content changed');
	assert(mixed.set.has('aleph') && mixed.set.has('beis'), 'hydrated set content changed');
	assert(mapA['key-259'].square === 67081, 'first map handle lost the final key');
	assert(mapB['key-000'].index === 0, 'second map handle lost the first key');
	assert(database.root.shared['key-200'].index === 200, 'fresh map handle saw stale data');
	assert(listA.length === 80 && listB.length === 80, 'sibling list lengths diverged');
	assert(listA[79].value === 'record-79', 'first list handle lost appended data');
	assert(listB.label === 'shared-list', 'second list handle lost named metadata');
	assert(listA.settings.metric === 'cosine', 'first list handle lost sibling metadata');
	assert(database.verify().ok, 'verifier failed after sibling-handle writes');
	database.close();
	database = null;

	database = new AwtsmoosDB(databasePath, { readOnly: true });
	database.open();
	const reopenedMixed = database.root.mixed.__resolve__();
	assert(reopenedMixed.map instanceof Map, 'reopened map identity changed');
	assert(reopenedMixed.set instanceof Set, 'reopened set identity changed');
	assert(reopenedMixed.set.has('beis'), 'reopened set content changed');
	assert(database.root.shared['key-259'].square === 67081, 'map data failed read-only reopen');
	assert(database.root.records.length === 80, 'list length failed read-only reopen');
	assert(database.root.records.label === 'shared-list', 'list metadata failed read-only reopen');
	assert(database.root.records.settings.dimensions === 16, 'nested metadata failed reopen');
	assert(database.verify().ok, 'read-only verifier failed');
} finally {
	if (database) database.close();
	fs.rmSync(directory, { recursive: true, force: true });
}

console.log('B"H live_handle_identity_test PASS');
