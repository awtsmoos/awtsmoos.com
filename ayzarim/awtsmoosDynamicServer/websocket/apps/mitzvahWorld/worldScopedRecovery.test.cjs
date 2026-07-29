// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file worldScopedRecovery.test.cjs
 * @description Proves self-first nearest interest and bounded scoped-snapshot recovery.
 * The Awtsmoos remains one world while each traveler beholds a lawful nearby garment;
 * Awtsmoos.com verifies radius, cap, self, nearest order, omitted distance, and no global backlog.
 */

const assert = require('node:assert/strict');
const test = require('node:test');
const { WorldInterestIndex } = require('./WorldInterestIndex.js');
const { WorldRecoveryService } = require('./WorldRecoveryService.js');

test('B"H interest cap keeps self then nearest entities', () => {
	const index = new WorldInterestIndex({ maximumEntities: 3, visibilityRadius: 100 });
	const client = { id: 'observer-client' };
	const observer = { id: 'self', position: { x: 0, y: 0, z: 0 } };
	const prepared = index.prepare([
		entity('far', 80),
		entity('near', 4),
		entity('self', 0),
		entity('middle', 20),
		entity('outside', 140)
	]);
	const delta = index.project(client, observer, prepared, 7);
	assert.deepEqual(delta.entered.map(value => value.id), ['self', 'near', 'middle']);
	assert.equal(delta.truncated, true);
	assert.equal(delta.radius, 100);
});

test('B"H reconnect returns one scoped snapshot and no global events', () => {
	const acknowledgements = [];
	const sessions = {
		acknowledge: (...values) => { acknowledgements.push(values); return values[1]; },
		forClient: () => ({ id: 'session-1' })
	};
	const client = { id: 'client' };
	const room = {
		revision: 19,
		snapshotFor: value => ({ interest: { radius: 64 }, playerId: value.id })
	};
	const result = new WorldRecoveryService(sessions).resync(client, room, 3);
	assert.deepEqual(result.events, []);
	assert.equal(result.fullSnapshotRequired, true);
	assert.equal(result.reason, 'interest-scoped-snapshot');
	assert.deepEqual(result.world, { interest: { radius: 64 }, playerId: 'client' });
	assert.deepEqual(acknowledgements[0], [client, 19, 19]);
});

function entity(id, x) {
	return { entityType: 'creature', id, position: { x, y: 0, z: 0 } };
}
