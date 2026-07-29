// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file worldInterestSoak.test.cjs
 * @description Proves bounded interest state across many clients, entities, movements, and revisions.
 * The Awtsmoos remains one world while each traveler receives one finite nearby garment;
 * Awtsmoos.com verifies self retention, caps, diagnostics, cleanup, and a generous runtime budget.
 */

const assert = require('node:assert/strict');
const test = require('node:test');
const { performance } = require('node:perf_hooks');
const { WorldInterestIndex } = require('./WorldInterestIndex.js');

const CLIENT_COUNT = 18;
const ENTITY_COUNT = 768;
const MAXIMUM_ENTITIES = 128;
const REVISIONS = 90;

test('B"H high-population interest remains capped and releases all state', () => {
	const index = new WorldInterestIndex({
		maximumEntities: MAXIMUM_ENTITIES,
		visibilityRadius: 180
	});
	const clients = Array.from({ length: CLIENT_COUNT }, (_, id) => ({ id: `client-${id}` }));
	const observers = clients.map((client, id) => ({
		id: `player-${id}`,
		position: positionFor(id, 0)
	}));
	const startedAt = performance.now();
	for (let revision = 1; revision <= REVISIONS; revision += 1) {
		const prepared = index.prepare(entitiesFor(revision));
		for (let clientIndex = 0; clientIndex < clients.length; clientIndex += 1) {
			const observer = observers[clientIndex];
			observer.position = positionFor(clientIndex, revision);
			const delta = index.project(
				clients[clientIndex],
				observer,
				prepared,
				revision
			);
			const retained = index.previousByClient.get(clients[clientIndex]);
			assert.ok(retained.size <= MAXIMUM_ENTITIES);
			assert.equal(retained.has(observer.id), true);
			assert.equal(delta.revision, revision);
		}
	}
	const elapsedMs = performance.now() - startedAt;
	const diagnostics = index.diagnostics();
	assert.equal(diagnostics.clients, CLIENT_COUNT);
	assert.ok(diagnostics.retainedEntities <= CLIENT_COUNT * MAXIMUM_ENTITIES);
	assert.equal(diagnostics.maximumEntities, MAXIMUM_ENTITIES);
	assert.ok(elapsedMs < 15000, `interest soak took ${elapsedMs.toFixed(1)}ms`);
	for (const client of clients) index.release(client);
	assert.deepEqual(index.diagnostics(), {
		cellSize: diagnostics.cellSize,
		clients: 0,
		maximumEntities: MAXIMUM_ENTITIES,
		radius: 180,
		retainedEntities: 0
	});
});

function entitiesFor(revision) {
	return Array.from({ length: ENTITY_COUNT }, (_, id) => {
		const selfId = id < CLIENT_COUNT ? `player-${id}` : `entity-${id}`;
		return {
			entityType: id < CLIENT_COUNT ? 'player' : 'creature',
			id: selfId,
			position: positionFor(id, revision)
		};
	});
}

function positionFor(id, revision) {
	const angle = id * 0.37 + revision * 0.025;
	const radius = 28 + id % 260;
	return {
		x: Math.cos(angle) * radius + revision * 0.4,
		y: 0,
		z: Math.sin(angle) * radius - revision * 0.25
	};
}
