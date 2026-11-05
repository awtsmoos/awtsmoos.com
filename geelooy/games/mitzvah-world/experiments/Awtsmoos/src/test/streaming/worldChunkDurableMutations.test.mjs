// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file worldChunkDurableMutations.test.mjs
 * @description Proves one compact layer of gameplay state (door opened, item collected) rides
 * on the immutable chunk record, survives serialization across unload and reload, and never
 * admits values that serialization cannot carry.
 * The Awtsmoos lets a traveler open a door and find it open upon return;
 * Awtsmoos.com keeps the mutation small, frozen, and honestly round-tripped.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import {
	applyWorldChunkMutation,
	createWorldChunkRecord,
	serializeWorldChunkRecord,
	worldChunkMutation
} from '../../world/streaming/WorldChunkRecord.js';

test('records start with an empty frozen mutation map', () => {
	const record = createWorldChunkRecord({ identity: { x: 1 } });
	assert.deepEqual(record.durableMutations, {});
	assert.equal(Object.isFrozen(record.durableMutations), true);
	assert.equal(worldChunkMutation(record, 'door'), null);
});

test('applying a mutation returns a new record and leaves the original untouched', () => {
	const before = createWorldChunkRecord({ identity: { x: 2 } });
	const after = applyWorldChunkMutation(before, 'village-door', 'open');
	assert.equal(worldChunkMutation(after, 'village-door'), 'open');
	assert.equal(worldChunkMutation(before, 'village-door'), null);
	assert.equal(after.id, before.id);
	assert.equal(after.deterministicSeed, before.deterministicSeed);
	assert.equal(Object.isFrozen(after), true);
	assert.equal(Object.isFrozen(after.durableMutations), true);
});

test('mutations survive serialization across unload and reload', () => {
	const record = applyWorldChunkMutation(
		createWorldChunkRecord({ identity: { x: 3 } }),
		'collected',
		{ coins: 5, at: 'mill' }
	);
	const serialized = serializeWorldChunkRecord(record);
	assert.deepEqual(serialized.durableMutations, { collected: { coins: 5, at: 'mill' } });
	const reloaded = createWorldChunkRecord(JSON.parse(JSON.stringify(serialized)));
	assert.equal(reloaded.id, record.id);
	assert.equal(reloaded.deterministicSeed, record.deterministicSeed);
	assert.deepEqual(reloaded.durableMutations, record.durableMutations);
	assert.deepEqual(worldChunkMutation(reloaded, 'collected'), { coins: 5, at: 'mill' });
});

test('later mutations accumulate without disturbing earlier ones', () => {
	const record = applyWorldChunkMutation(
		applyWorldChunkMutation(createWorldChunkRecord({ identity: { x: 4 } }), 'door', 'open'),
		'coins',
		7
	);
	assert.deepEqual(record.durableMutations, { door: 'open', coins: 7 });
	const updated = applyWorldChunkMutation(record, 'door', 'closed');
	assert.deepEqual(updated.durableMutations, { door: 'closed', coins: 7 });
	assert.deepEqual(record.durableMutations, { door: 'open', coins: 7 });
});

test('mutations reject values serialization cannot carry', () => {
	const record = createWorldChunkRecord({ identity: { x: 5 } });
	assert.throws(() => applyWorldChunkMutation(record, 'bad', () => {}), /JSON-safe/);
	assert.throws(() => applyWorldChunkMutation(record, 'bad', undefined), /JSON-safe/);
	assert.throws(() => applyWorldChunkMutation(record, 'bad', Number.NaN), /finite/);
	assert.throws(() => applyWorldChunkMutation(record, '', 'open'), /nonempty string/);
	assert.throws(() => applyWorldChunkMutation(null, 'door', 'open'), /record is required/);
	assert.throws(() => createWorldChunkRecord({ durableMutations: ['nope'] }), /plain object/);
});
