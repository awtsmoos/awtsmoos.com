//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MitzvahWorldPlayerBuilding.js
 * @description Lets the traveler raise real structures in the living world: sukkah, fence,
 * lantern, bench, and well. Every placement is bounded, budgeted, and honest — materials are
 * debited from the true inventory, collision is registered, and structures persist in the
 * chunk's durable mutations across unload and reload.
 * The Awtsmoos lets hands build what the heart intends; Awtsmoos.com keeps every stone
 * counted, so no tower rises without its wood and no wall outlives its measure.
 */

import { applyWorldChunkMutation, worldChunkMutation } from '../world/streaming/WorldChunkRecord.js';

export const BUILDINGS_MUTATION_KEY = 'player-buildings';

/** Hard bounds: the world never carries more than this. */
export const MAX_STRUCTURES_PER_CHUNK = 24;
export const MAX_STRUCTURES_WORLD = 200;

/** One placement commit per frame: building never steals the generation budget. */
const MAX_COMMITS_PER_FRAME = 1;

/** Maximum terrain grade (rise over run) a structure may stand on. */
const MAX_GRADE = 0.45;

export const BUILDABLE_STRUCTURES = Object.freeze({
	sukkah: Object.freeze({
		id: 'sukkah', name: 'Sukkah', icon: '🌿',
		cost: Object.freeze({ 'wood-log': 8 }),
		radius: 2.5, height: 3.0,
		description: 'A booth of branches for travelers to rest beneath.'
	}),
	fence: Object.freeze({
		id: 'fence', name: 'Fence', icon: '🪵',
		cost: Object.freeze({ 'wood-log': 2 }),
		radius: 0.8, height: 1.2,
		description: 'A short wooden fence to mark a boundary.'
	}),
	lantern: Object.freeze({
		id: 'lantern', name: 'Lantern Post', icon: '🏮',
		cost: Object.freeze({ 'wood-log': 1, 'glass-pane': 1 }),
		radius: 0.5, height: 2.2,
		description: 'A post of wood and glass to light the road.'
	}),
	bench: Object.freeze({
		id: 'bench', name: 'Bench', icon: '🪑',
		cost: Object.freeze({ 'wood-log': 3 }),
		radius: 1.0, height: 0.6,
		description: 'A wooden bench for the weary.'
	}),
	well: Object.freeze({
		id: 'well', name: 'Well', icon: '🪨',
		cost: Object.freeze({ 'stone-block': 6 }),
		radius: 1.5, height: 1.8,
		description: 'A stone well for fresh water.'
	})
});

/** Lists every buildable structure id. */
export function buildableStructureIds() {
	return Object.keys(BUILDABLE_STRUCTURES);
}

/** Creates one player-building runtime. All world access goes through injected vessels. */
export function createMitzvahWorldPlayerBuilding(vessels = {}) {
	const inventory = vessels.inventory || null;
	const getChunkRecord = vessels.getChunkRecord || (() => null);
	const putChunkRecord = vessels.putChunkRecord || (() => {});
	const chunkIdFor = vessels.chunkIdFor || (() => 'unknown');
	const heightAt = vessels.heightAt || (() => 0);
	const collisionQueue = vessels.collisionQueue || null;
	const onEvent = vessels.onEvent || (() => {});
	const nextId = vessels.nextId || (() => `bld_${Date.now().toString(36)}_${Math.floor(Math.random() * 1e6).toString(36)}`);

	const state = {
		selected: 'sukkah',
		ghost: null,
		lastCommitFrame: -1,
		worldCount: 0
	};

	function structuresOf(record) {
		const list = worldChunkMutation(record, BUILDINGS_MUTATION_KEY);
		return Array.isArray(list) ? list : [];
	}

	function countWorld() {
		return state.worldCount;
	}

	function canAfford(definition) {
		if (!inventory) return { ok: false, reason: 'no-inventory' };
		for (const [itemId, qty] of Object.entries(definition.cost)) {
			if ((inventory.quantity?.(itemId) || 0) < qty) {
				return { ok: false, reason: 'insufficient-materials', itemId };
			}
		}
		return { ok: true };
	}

	function debit(definition) {
		for (const [itemId, qty] of Object.entries(definition.cost)) {
			inventory.remove(itemId, qty);
		}
	}

	function refund(definition) {
		for (const [itemId, qty] of Object.entries(definition.cost)) {
			const back = Math.floor(qty / 2);
			if (back > 0) inventory.add(itemId, back);
		}
	}

	/** Points the placement ghost at a world position; returns the ghost verdict. */
	function aimAt(x, z, frameId = 0) {
		const definition = BUILDABLE_STRUCTURES[state.selected];
		if (!definition) {
			state.ghost = { valid: false, reason: 'unknown-structure' };
			return state.ghost;
		}
		const y = heightAt(x, z);
		const ghost = { structureId: definition.id, x, y, z, valid: true, reason: null };

		const afford = canAfford(definition);
		if (!afford.ok) {
			ghost.valid = false;
			ghost.reason = afford.reason;
			ghost.itemId = afford.itemId;
			state.ghost = ghost;
			return ghost;
		}
		if (countWorld() >= MAX_STRUCTURES_WORLD) {
			ghost.valid = false;
			ghost.reason = 'world-cap';
			state.ghost = ghost;
			return ghost;
		}
		const chunkId = chunkIdFor(x, z);
		const record = getChunkRecord(chunkId);
		const siblings = structuresOf(record);
		if (siblings.length >= MAX_STRUCTURES_PER_CHUNK) {
			ghost.valid = false;
			ghost.reason = 'chunk-cap';
			state.ghost = ghost;
			return ghost;
		}
		for (const other of siblings) {
			const dx = other.x - x;
			const dz = other.z - z;
			const need = (other.radius || 1) + definition.radius;
			if (dx * dx + dz * dz < need * need) {
				ghost.valid = false;
				ghost.reason = 'overlap';
				state.ghost = ghost;
				return ghost;
			}
		}
		const r = definition.radius;
		const grades = [
			Math.abs(heightAt(x + r, z) - y) / r,
			Math.abs(heightAt(x - r, z) - y) / r,
			Math.abs(heightAt(x, z + r) - y) / r,
			Math.abs(heightAt(x, z - r) - y) / r
		];
		if (Math.max(...grades) > MAX_GRADE) {
			ghost.valid = false;
			ghost.reason = 'too-steep';
			state.ghost = ghost;
			return ghost;
		}
		state.ghost = ghost;
		return ghost;
	}

	/** Commits the ghosted placement. At most one commit per frame. */
	function commit(frameId = 0) {
		if (frameId === state.lastCommitFrame) {
			return { ok: false, reason: 'frame-budget' };
		}
		const ghost = state.ghost;
		if (!ghost?.valid) {
			return { ok: false, reason: ghost?.reason || 'no-ghost' };
		}
		const definition = BUILDABLE_STRUCTURES[ghost.structureId];
		const afford = canAfford(definition);
		if (!afford.ok) return { ok: false, reason: afford.reason };
		if (countWorld() >= MAX_STRUCTURES_WORLD) return { ok: false, reason: 'world-cap' };

		const chunkId = chunkIdFor(ghost.x, ghost.z);
		const record = getChunkRecord(chunkId);
		if (!record) return { ok: false, reason: 'no-chunk' };
		const siblings = [...structuresOf(record)];
		if (siblings.length >= MAX_STRUCTURES_PER_CHUNK) return { ok: false, reason: 'chunk-cap' };

		debit(definition);
		const structure = Object.freeze({
			id: nextId(),
			structureId: definition.id,
			x: ghost.x, y: ghost.y, z: ghost.z,
			radius: definition.radius, height: definition.height,
			chunkId,
			placedAt: Date.now()
		});
		putChunkRecord(chunkId, applyWorldChunkMutation(record, BUILDINGS_MUTATION_KEY, [...siblings, structure]));
		state.worldCount += 1;
		state.lastCommitFrame = frameId;
		if (collisionQueue && typeof collisionQueue.addBox === 'function') {
			collisionQueue.addBox(boxOf(structure));
		} else if (collisionQueue && Array.isArray(collisionQueue.additions)) {
			for (const triangle of boxTriangles(structure)) {
				collisionQueue.additions.push(triangle);
			}
		}
		onEvent({ type: 'build', target: definition.id, count: 1, structureId: structure.id });
		state.ghost = null;
		return { ok: true, structure };
	}

	/** Dismantles one owned structure, refunding half its materials. */
	function dismantle(chunkId, structureInstanceId) {
		const record = getChunkRecord(chunkId);
		if (!record) return { ok: false, reason: 'no-chunk' };
		const siblings = [...structuresOf(record)];
		const index = siblings.findIndex(item => item.id === structureInstanceId);
		if (index < 0) return { ok: false, reason: 'not-found' };
		const [structure] = siblings.splice(index, 1);
		const definition = BUILDABLE_STRUCTURES[structure.structureId];
		if (definition) refund(definition);
		putChunkRecord(chunkId, applyWorldChunkMutation(record, BUILDINGS_MUTATION_KEY, siblings));
		state.worldCount = Math.max(0, state.worldCount - 1);
		if (collisionQueue && typeof collisionQueue.removeBox === 'function') {
			collisionQueue.removeBox(boxOf(structure));
		}
		onEvent({ type: 'dismantle', target: structure.structureId, count: 1 });
		return { ok: true, structure };
	}

	function select(structureId) {
		if (!BUILDABLE_STRUCTURES[structureId]) return false;
		state.selected = structureId;
		state.ghost = null;
		return true;
	}

	function recount(records) {
		let total = 0;
		for (const record of records || []) total += structuresOf(record).length;
		state.worldCount = total;
		return total;
	}

	return Object.freeze({
		aimAt,
		commit,
		dismantle,
		select,
		recount,
		structuresOf,
		get selected() { return state.selected; },
		get ghost() { return state.ghost; },
		get worldCount() { return state.worldCount; }
	});
}

/** Axis-aligned collision box for one placed structure. */
export function boxOf(structure) {
	const half = structure.radius || 1;
	return Object.freeze({
		minX: structure.x - half, maxX: structure.x + half,
		minY: structure.y, maxY: structure.y + (structure.height || 2),
		minZ: structure.z - half, maxZ: structure.z + half
	});
}

/** Expands a collision box into 12 triangles for the mutation queue. Pure math, no allocation beyond the list. */
export function boxTriangles(structure) {
	const box = boxOf(structure);
	const { minX, maxX, minY, maxY, minZ, maxZ } = box;
	const corners = [
		[minX, minY, minZ], [maxX, minY, minZ], [maxX, minY, maxZ], [minX, minY, maxZ],
		[minX, maxY, minZ], [maxX, maxY, minZ], [maxX, maxY, maxZ], [minX, maxY, maxZ]
	];
	const faces = [
		[0, 1, 2], [0, 2, 3],
		[4, 6, 5], [4, 7, 6],
		[0, 4, 5], [0, 5, 1],
		[2, 6, 7], [2, 7, 3],
		[0, 3, 7], [0, 7, 4],
		[1, 5, 6], [1, 6, 2]
	];
	return faces.map(([a, b, c]) => [corners[a], corners[b], corners[c]]);
}
