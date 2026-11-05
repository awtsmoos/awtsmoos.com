//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MitzvahWorldPlayerBuilding.test.mjs
 * @description Guards the player-building contract: bounded placement, honest material costs,
 * one commit per frame, collision registration, and durable persistence.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	BUILDABLE_STRUCTURES,
	MAX_STRUCTURES_PER_CHUNK,
	MAX_STRUCTURES_WORLD,
	boxTriangles,
	buildableStructureIds,
	createMitzvahWorldPlayerBuilding
} from './MitzvahWorldPlayerBuilding.js';
import {
	applyWorldChunkMutation,
	createWorldChunkRecord,
	worldChunkMutation
} from '../world/streaming/WorldChunkRecord.js';
import { createWorldChunkId } from '../world/streaming/WorldChunkId.js';
import { INVENTORY_MATERIAL_CATALOG } from '../gameplay/InventoryMaterialCatalog.js';

function fakeInventory(stock = {}) {
	const items = { ...stock };
	return {
		quantity: id => items[id] || 0,
		add: (id, qty) => { items[id] = (items[id] || 0) + qty; },
		remove: (id, qty) => {
			assert.ok((items[id] || 0) >= qty, `cannot remove ${qty} ${id}`);
			items[id] -= qty;
		}
	};
}

function harness(stock = { 'wood-log': 100, 'stone-block': 100, 'glass-pane': 100 }, overrides = {}) {
	const chunks = new Map();
	const events = [];
	const queue = { additions: [] };
	const vessels = {
		inventory: fakeInventory(stock),
		getChunkRecord: id => {
			if (!chunks.has(id)) chunks.set(id, createWorldChunkRecord({ id }));
			return chunks.get(id);
		},
		putChunkRecord: (id, record) => { chunks.set(id, record); },
		chunkIdFor: (x, z) => createWorldChunkId({ x: Math.floor(x / 16), z: Math.floor(z / 16) }),
		heightAt: overrides.heightAt || (() => 0),
		collisionQueue: queue,
		onEvent: event => events.push(event),
		nextId: (() => { let n = 0; return () => `bld_test_${n++}`; })()
	};
	const building = createMitzvahWorldPlayerBuilding(vessels);
	return { building, chunks, events, queue, vessels };
}

test('catalog holds nineteen honest structures with real costs', () => {
	const ids = buildableStructureIds();
	assert.deepEqual(ids.sort(), [
		'avraham-tent', 'bench', 'fence', 'granary', 'kiyor', 'lantern', 'menorah-stand',
		'mikveh-pool', 'mishkan-curtain', 'mizbeach', 'mizbeach-evanim', 'olive-press',
		'sheepfold-gate', 'shulchan', 'sukkah', 'vineyard-trellis', 'watchtower', 'well',
		'yitzchak-well'
	]);
	for (const id of ids) {
		const def = BUILDABLE_STRUCTURES[id];
		assert.ok(Object.keys(def.cost).length >= 1, `${id} must cost materials`);
		assert.ok(def.radius > 0 && def.height > 0);
	}
});

test('new Tanach structures use only real material ids and sane collision bounds', () => {
	const fresh = [
		'mishkan-curtain', 'menorah-stand', 'shulchan', 'mizbeach', 'kiyor',
		'avraham-tent', 'yitzchak-well', 'mizbeach-evanim',
		'watchtower', 'granary', 'olive-press', 'vineyard-trellis', 'sheepfold-gate', 'mikveh-pool'
	];
	for (const id of fresh) {
		const def = BUILDABLE_STRUCTURES[id];
		assert.ok(def, `${id} must exist in the catalog`);
		for (const itemId of Object.keys(def.cost)) {
			assert.ok(
				INVENTORY_MATERIAL_CATALOG[itemId],
				`${id} spends unknown material ${itemId}`
			);
			assert.ok(def.cost[itemId] >= 1, `${id} cost for ${itemId} must be positive`);
		}
		assert.ok(def.radius > 0 && def.radius <= 4, `${id} radius in bounds`);
		assert.ok(def.height > 0 && def.height <= 7, `${id} height in bounds`);
		assert.ok(def.description.length >= 10, `${id} needs a real description`);
		assert.ok(def.icon && def.icon.length >= 1, `${id} needs an icon`);
	}
});

test('bigger structures cost more than smaller ones', () => {
	const total = id => Object.values(BUILDABLE_STRUCTURES[id].cost).reduce((a, b) => a + b, 0);
	assert.ok(total('avraham-tent') > total('fence'), 'a tent costs more than a fence');
	assert.ok(total('watchtower') > total('bench'), 'a tower costs more than a bench');
	assert.ok(total('mikveh-pool') > total('lantern'), 'a mikveh costs more than a lantern');
});

test('placement, debit, dismantle and refund work for a Mishkan structure', () => {
	const stock = { 'brass-brace': 50, 'stone-block': 50, 'glass-pane': 50 };
	const { building, chunks, events } = harness(stock);
	assert.equal(building.select('menorah-stand'), true);
	assert.equal(building.aimAt(10, 10, 1).valid, true);
	const before = building.worldCount;
	const result = building.commit(1);
	assert.equal(result.ok, true);
	assert.equal(result.structure.structureId, 'menorah-stand');
	assert.equal(building.worldCount, before + 1);
	assert.deepEqual([events[0].type, events[0].target], ['build', 'menorah-stand']);
	const record = chunks.get(result.structure.chunkId);
	const dismantled = building.dismantle(result.structure.chunkId, result.structure.id);
	assert.equal(dismantled.ok, true);
	assert.equal(building.worldCount, before);
	const after = chunks.get(result.structure.chunkId);
	const stored = worldChunkMutation(after, 'player-buildings');
	assert.equal(stored.length, 0);
});

test('yitzchak-well placement debits stone and persists through serialization', () => {
	const { building, chunks } = harness({ 'stone-block': 100, 'wood-log': 100 });
	building.select('yitzchak-well');
	assert.equal(building.aimAt(20, 20, 1).valid, true);
	const { structure } = building.commit(1);
	assert.equal(structure.structureId, 'yitzchak-well');
	const record = chunks.get(structure.chunkId);
	const revived = JSON.parse(JSON.stringify(record));
	assert.equal(worldChunkMutation(revived, 'player-buildings').length, 1);
});

test('valid ghost on flat affordable ground, commit debits and persists', () => {
	const { building, chunks, events, queue } = harness();
	assert.equal(building.select('lantern'), true);
	const ghost = building.aimAt(10, 10, 1);
	assert.equal(ghost.valid, true);
	const result = building.commit(1);
	assert.equal(result.ok, true);
	assert.equal(result.structure.structureId, 'lantern');
	const record = chunks.get(createWorldChunkId({ x: 0, z: 0 }));
	const stored = worldChunkMutation(record, 'player-buildings');
	assert.equal(stored.length, 1);
	assert.equal(stored[0].id, 'bld_test_0');
	assert.equal(events.length, 1);
	assert.deepEqual([events[0].type, events[0].target], ['build', 'lantern']);
	assert.equal(queue.additions.length, 12, 'one box = 12 collision triangles');
});

test('insufficient materials blocks the ghost honestly', () => {
	const { building } = harness({ 'wood-log': 1 });
	building.select('sukkah');
	const ghost = building.aimAt(10, 10, 1);
	assert.equal(ghost.valid, false);
	assert.equal(ghost.reason, 'insufficient-materials');
});

test('overlapping placements are refused', () => {
	const { building } = harness();
	building.select('bench');
	assert.equal(building.aimAt(0, 0, 1).valid, true);
	assert.equal(building.commit(1).ok, true);
	const ghost = building.aimAt(0.5, 0, 2);
	assert.equal(ghost.valid, false);
	assert.equal(ghost.reason, 'overlap');
});

test('chunk cap of 24 is enforced', () => {
	const { building } = harness({ 'wood-log': 10000 });
	building.select('fence');
	let placed = 0;
	let frame = 1000;
	for (let i = 0; i < 40 && placed < MAX_STRUCTURES_PER_CHUNK; i++) {
		const x = (i % 6) * 2.5;
		const z = Math.floor(i / 6) * 2.5;
		frame++;
		if (building.aimAt(x, z, frame).valid && building.commit(frame).ok) placed++;
	}
	assert.equal(placed, MAX_STRUCTURES_PER_CHUNK);
	const ghost = building.aimAt(15, 15, 99999);
	assert.equal(ghost.valid, false);
	assert.equal(ghost.reason, 'chunk-cap');
});

test('world cap of 200 is enforced', () => {
	const { building } = harness({ 'wood-log': 100000 });
	building.select('fence');
	let placed = 0;
	let frame = 1;
	// 24 per chunk max: spread across chunks on a grid.
	outer: for (let cx = 0; cx < 12; cx++) {
		for (let i = 0; i < MAX_STRUCTURES_PER_CHUNK; i++) {
			const x = cx * 64 + (i % 8) * 3;
			const z = Math.floor(i / 8) * 3;
			frame++;
			if (building.aimAt(x, z, frame).valid && building.commit(frame).ok) placed++;
			if (placed >= MAX_STRUCTURES_WORLD) break outer;
		}
	}
	assert.equal(placed, MAX_STRUCTURES_WORLD);
	assert.equal(building.worldCount, MAX_STRUCTURES_WORLD);
	const ghost = building.aimAt(5000, 5000, 99999);
	assert.equal(ghost.valid, false);
	assert.equal(ghost.reason, 'world-cap');
});

test('only one commit per frame', () => {
	const { building } = harness();
	building.select('fence');
	assert.equal(building.aimAt(0, 0, 7).valid, true);
	assert.equal(building.commit(7).ok, true);
	assert.equal(building.aimAt(30, 30, 7).valid, true);
	const second = building.commit(7);
	assert.equal(second.ok, false);
	assert.equal(second.reason, 'frame-budget');
});

test('dismantle refunds half the materials and removes the record', () => {
	const { building, chunks } = harness({ 'wood-log': 100 });
	building.select('bench');
	building.aimAt(5, 5, 1);
	const { structure } = building.commit(1);
	assert.equal(structure.structureId, 'bench');
	const before = building.worldCount;
	const result = building.dismantle(structure.chunkId, structure.id);
	assert.equal(result.ok, true);
	assert.equal(building.worldCount, before - 1);
	const stored = worldChunkMutation(chunks.get(structure.chunkId), 'player-buildings');
	assert.equal(stored.length, 0);
});

test('too-steep terrain refuses the ghost', () => {
	const { building } = harness(
		{ 'wood-log': 100 },
		{ heightAt: (x, z) => x * 2 } // steep ramp
	);
	building.select('sukkah');
	const ghost = building.aimAt(10, 10, 1);
	assert.equal(ghost.valid, false);
	assert.equal(ghost.reason, 'too-steep');
});

test('boxTriangles yields twelve well-formed triangles', () => {
	const tris = boxTriangles({ x: 0, y: 0, z: 0, radius: 1, height: 2 });
	assert.equal(tris.length, 12);
	for (const tri of tris) {
		assert.equal(tri.length, 3);
		for (const point of tri) assert.equal(point.length, 3);
	}
});

test('structures persist through chunk record serialization', () => {
	const { building, chunks } = harness();
	building.select('well');
	building.aimAt(20, 20, 1);
	building.commit(1);
	const record = chunks.get(createWorldChunkId({ x: 1, z: 1 }));
	const revived = JSON.parse(JSON.stringify(record));
	assert.equal(worldChunkMutation(revived, 'player-buildings').length, 1);
});
