//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MitzvahWorldBuildMissions.test.mjs
 * @description End-to-end proof that building drives real missions: accept a build quest,
 * raise the structures through the building system, and watch the quest complete.
 * The Awtsmoos joins hands and heart; every plank placed here moves a shlichus forward.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { AdventureStore } from '../gameplay/AdventureStore.js';
import { ADVENTURE_CATALOG, adventureDefinition } from '../gameplay/AdventureCatalog.js';
import { createMitzvahWorldPlayerBuilding } from './MitzvahWorldPlayerBuilding.js';
import {
	createWorldChunkRecord,
	worldChunkMutation
} from '../world/streaming/WorldChunkRecord.js';
import { createWorldChunkId } from '../world/streaming/WorldChunkId.js';

function fakeInventory(stock) {
	const items = { ...stock };
	return {
		quantity: id => items[id] || 0,
		add: (id, qty) => { items[id] = (items[id] || 0) + qty; },
		remove: (id, qty) => { items[id] = (items[id] || 0) - qty; }
	};
}

function wiredWorld(stock) {
	const questStore = new AdventureStore();
	const chunks = new Map();
	const vessels = {
		inventory: fakeInventory(stock),
		getChunkRecord: id => {
			if (!chunks.has(id)) chunks.set(id, createWorldChunkRecord({ id }));
			return chunks.get(id);
		},
		putChunkRecord: (id, record) => { chunks.set(id, record); },
		chunkIdFor: (x, z) => createWorldChunkId({ x: Math.floor(x / 64), z: Math.floor(z / 64) }),
		heightAt: () => 0,
		collisionQueue: { additions: [] },
		onEvent: event => questStore.recordEvent(event),
		nextId: (() => { let n = 0; return () => `bld_m_${n++}`; })()
	};
	return { questStore, building: createMitzvahWorldPlayerBuilding(vessels) };
}

function place(building, structureId, x, z, frame) {
	assert.equal(building.select(structureId), true);
	const ghost = building.aimAt(x, z, frame);
	assert.equal(ghost.valid, true, `ghost invalid: ${ghost.reason}`);
	const result = building.commit(frame);
	assert.equal(result.ok, true);
	return result.structure;
}

test('catalog carries the three building missions', () => {
	for (const id of ['sukkah-for-travelers', 'light-the-east-road', 'fence-the-pasture']) {
		const def = adventureDefinition(id);
		assert.ok(def, `missing mission ${id}`);
		assert.ok(def.objectives.length >= 1);
		assert.ok(def.objectives.every(o => o.eventType === 'build'));
	}
	assert.ok(ADVENTURE_CATALOG.length >= 16, 'catalog keeps growing, never shrinking');
});

test('sukkah mission completes when the sukkah is raised', () => {
	const { questStore, building } = wiredWorld({ 'wood-log': 50 });
	questStore.offer('sukkah-for-travelers');
	questStore.accept('sukkah-for-travelers');
	place(building, 'sukkah', 14, -38, 1);
	const snapshot = questStore.snapshot();
	assert.equal(snapshot.completed.length, 1);
	assert.equal(snapshot.completed[0].definition.id, 'sukkah-for-travelers');
});

test('lantern mission tracks four placements then completes', () => {
	const { questStore, building } = wiredWorld({ 'wood-log': 50, 'glass-pane': 50 });
	questStore.accept('light-the-east-road');
	for (let i = 0; i < 3; i++) place(building, 'lantern', 30 + i * 4, -60, 10 + i);
	let snapshot = questStore.snapshot();
	assert.equal(snapshot.completed.length, 0, 'three of four is not done');
	place(building, 'lantern', 42, -60, 14);
	snapshot = questStore.snapshot();
	assert.equal(snapshot.completed.length, 1);
	assert.equal(snapshot.completed[0].definition.id, 'light-the-east-road');
});

test('fence mission completes at eight segments', () => {
	const { questStore, building } = wiredWorld({ 'wood-log': 100 });
	questStore.accept('fence-the-pasture');
	for (let i = 0; i < 8; i++) place(building, 'fence', 96 + i * 3, 44, 20 + i);
	const snapshot = questStore.snapshot();
	assert.equal(snapshot.completed.length, 1);
	assert.equal(snapshot.completed[0].definition.id, 'fence-the-pasture');
});

test('build events do not disturb unrelated quests', () => {
	const { questStore, building } = wiredWorld({ 'wood-log': 100 });
	questStore.accept('sukkah-for-travelers');
	questStore.accept('flowers-for-shabbos');
	place(building, 'fence', 200, 200, 1);
	const snapshot = questStore.snapshot();
	assert.equal(snapshot.completed.length, 0);
	const sukkah = snapshot.active.find(q => q.definition.id === 'sukkah-for-travelers');
	assert.equal(sukkah.objectives[0].progress, 0);
});

test('mission progress survives store serialization', () => {
	const { questStore, building } = wiredWorld({ 'wood-log': 50, 'glass-pane': 50 });
	questStore.accept('light-the-east-road');
	place(building, 'lantern', 30, -60, 1);
	place(building, 'lantern', 34, -60, 2);
	const saved = questStore.serialize();
	const restored = new AdventureStore();
	restored.restore(saved);
	const snapshot = restored.snapshot();
	const quest = snapshot.active.find(q => q.definition.id === 'light-the-east-road');
	assert.ok(quest, 'quest restored as active');
	assert.equal(quest.objectives[0].progress, 2);
});
