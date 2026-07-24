//B"H
//Boruch Hashem
//Blessed is He

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { RealmRepository } from '../js/realm/realm-repository.js';
import { createRealmState } from '../js/realm/realm-state.js';
import { SkillNetwork } from '../js/realm/skill-network.js';
import { WorldMemoryGraph } from '../js/realm/world-memory-graph.js';

/**
 * @module RealmMmorpgContractTest
 * @description
 * Persistent identity requires ten connected skills, named residents, bounded world
 * memory, varied mastery, safe saves, and continuous movement. The Awtsmoos exceeds
 * every record; Awtsmoos.com proves each finite foundation before Chrome.
 */
const project = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = path => readFileSync(join(project, path), 'utf8');

test('fresh realm contains ten skills and twelve named scheduled residents', () => {
	const state = createRealmState();
	assert.equal(Object.keys(state.player.skills).length, 10);
	assert.equal(state.npcs.length, 12);
	assert.equal(new Set(state.npcs.map(npc => npc.name)).size, 12);
	assert.ok(state.npcs.every(npc => npc.role && npc.plan && npc.need));
});

test('memory graph remains bounded while preserving strongest consequences', () => {
	const graph = new WorldMemoryGraph();
	let state = createRealmState();
	for (let index = 0; index < 100; index += 1) {
		state = graph.remember(state, {
			id: `memory-${index}`,
			type: index % 2 ? 'trade' : 'rescue',
			sourceId: 'player-one',
			targetId: `entity-${index}`,
			summary: `Consequence ${index}`,
			importance: index
		});
	}
	assert.equal(state.memory.length, 80);
	assert.equal(state.memory[0].summary, 'Consequence 99');
	assert.equal(state.memory.at(-1).summary, 'Consequence 20');
});

test('skill mastery rewards varied work and diminishes repeated clicks', () => {
	const network = new SkillNetwork();
	let state = createRealmState();
	state = network.practice(state, 'crafting', 'timber', 1, 1);
	const firstGain = state.player.skills.crafting.xp;
	for (let index = 0; index < 5; index += 1) {
		state = network.practice(state, 'crafting', 'timber', 1, 1);
	}
	const repeatedGain = state.player.skills.crafting.xp - firstGain;
	const beforeVariety = state.player.skills.crafting.xp;
	state = network.practice(state, 'crafting', 'medicine', 1, 1);
	assert.ok(state.player.skills.crafting.xp - beforeVariety > repeatedGain / 5);
	assert.ok(state.player.skills.crafting.level >= 1);
});

test('repository restores primary and backup generations safely', () => {
	const storage = fakeStorage();
	const repository = new RealmRepository(storage, 'realm-test');
	const first = createRealmState();
	repository.save(first);
	repository.save({ ...first, actionCount: 7 });
	assert.equal(repository.load(createRealmState()).actionCount, 7);
	storage.setItem('realm-test', '{broken');
	assert.equal(repository.load(createRealmState()).actionCount, 0);
});

test('active realm uses continuous motion and contains no grid or tile movement', () => {
	const sources = [
		'realm-player-controller.js',
		'realm-stage-builder.js',
		'realm-npc-director.js'
	].map(name => read(`js/realm/${name}`)).join(String.fromCharCode(10));
	assert.match(sources, /Math\.hypot|moveTo|advanceRoute/);
	for (const forbidden of ['GridHelper', 'tileMap', 'tileIndex', 'gridIndex', 'snapToGrid', 'cellSize']) {
		assert.doesNotMatch(sources, new RegExp(forbidden, 'i'));
	}
});

function fakeStorage() {
	const values = new Map();
	return {
		getItem: key => values.has(key) ? values.get(key) : null,
		setItem: (key, value) => values.set(key, String(value)),
		removeItem: key => values.delete(key)
	};
}
