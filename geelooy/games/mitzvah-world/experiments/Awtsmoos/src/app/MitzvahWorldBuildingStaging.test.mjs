//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MitzvahWorldBuildingStaging.test.mjs
 * @description Guards the placement ghost and staged construction: validity tint,
 * collision-footprint honesty, every piece staged exactly once, and raw-timber
 * framing before clad walls and finished roofs.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	BUILDABLE_STRUCTURES,
	CONSTRUCTION_TOTAL_MS,
	boxOf,
	createMitzvahWorldPlayerBuilding
} from './MitzvahWorldPlayerBuilding.js';
import {
	buildConstructionStages,
	buildGhostPreview,
	buildStructureMeshes,
	constructionStageOfPiece,
	constructionStageTimings,
	constructionTotalMs
} from './MitzvahWorldBuildingMeshes.js';

function placed(id, x = 10, z = 20, y = 5) {
	const definition = BUILDABLE_STRUCTURES[id];
	return {
		id: `bld_stage_${id.replaceAll('-', '_')}`,
		structureId: id,
		x, y, z,
		radius: definition.radius,
		height: definition.height
	};
}

test('ghost preview tints green when valid and red when invalid', () => {
	const valid = buildGhostPreview({ structureId: 'sukkah', x: 1, y: 2, z: 3, valid: true });
	assert.equal(valid.length, 1);
	assert.equal(valid[0].material.color, 0x2eff7a);
	assert.equal(valid[0].valid, true);
	assert.equal(valid[0].ghost, true);
	assert.equal(valid[0].solid, false);

	const invalid = buildGhostPreview({ structureId: 'sukkah', x: 1, y: 2, z: 3, valid: false });
	assert.equal(invalid.length, 1);
	assert.equal(invalid[0].material.color, 0xff3b30);
	assert.equal(invalid[0].valid, false);
});

test('ghost footprint matches the registered collision box', () => {
	for (const id of ['sukkah', 'watchtower', 'mikveh-pool', 'well']) {
		const structure = placed(id);
		const [ghost] = buildGhostPreview({ structureId: id, x: structure.x, y: structure.y, z: structure.z, valid: true });
		const box = boxOf(structure);
		assert.equal(ghost.position.x, structure.x);
		assert.ok(Math.abs(ghost.size.x - (box.maxX - box.minX)) < 1e-9, 'ghost width matches collision box');
		assert.ok(Math.abs(ghost.size.z - (box.maxZ - box.minZ)) < 1e-9, 'ghost depth matches collision box');
		assert.ok(ghost.position.y + ghost.size.y / 2 <= box.maxY + 0.01);
	}
});

test('ghost returns empty for unknown structures and missing verdicts', () => {
	assert.deepEqual(buildGhostPreview({ structureId: 'nope', x: 0, y: 0, z: 0, valid: true }), []);
	assert.deepEqual(buildGhostPreview(null), []);
});

test('every piece lands in exactly one construction stage', () => {
	for (const id of ['sukkah', 'well', 'watchtower', 'menorah-stand', 'mizbeach']) {
		const structure = placed(id);
		const groups = buildConstructionStages(structure);
		assert.equal(groups.length, 3);
		const staged = groups.flatMap(group => group.pieces);
		const full = buildStructureMeshes(structure);
		assert.equal(staged.length, full.length, `${id}: no piece lost or duplicated`);
		const ids = new Set(staged.map(piece => piece.id));
		assert.equal(ids.size, staged.length, `${id}: piece ids stay unique across stages`);
		for (const [index, group] of groups.entries()) {
			for (const piece of group.pieces) {
				assert.equal(piece.position.x, structure.x + piece.local.x, `${id} keeps world positions`);
				assert.ok([0, 1, 2].includes(index));
			}
		}
	}
});

test('frame stage renders in raw timber, later stages keep authored materials', () => {
	const groups = buildConstructionStages(placed('sukkah'));
	const framePieces = groups[0].pieces;
	assert.ok(framePieces.length >= 1, 'sukkah has framing');
	for (const piece of framePieces) {
		assert.equal(piece.material.color, 0xa08050, 'frame uses raw timber');
		assert.equal(piece.material.proceduralTexture, 'wood');
	}
	const later = [...groups[1].pieces, ...groups[2].pieces];
	assert.ok(later.length >= 1);
	for (const piece of later) {
		assert.equal(piece.stageMaterial, 'authored');
	}
});

test('stage classifier puts posts in frame and roofs in finish', () => {
	assert.equal(constructionStageOfPiece({ id: 'x-post-0' }), 0);
	assert.equal(constructionStageOfPiece({ id: 'x-beam-n' }), 0);
	assert.equal(constructionStageOfPiece({ id: 'x-roof' }), 2);
	assert.equal(constructionStageOfPiece({ id: 'x-schach' }), 2);
	assert.equal(constructionStageOfPiece({ id: 'x-wall-1' }), 1);
	assert.equal(constructionStageOfPiece({ id: 'x-mystery' }), 1);
});

test('construction timings sum to the staged total (~2.4s)', () => {
	const timings = constructionStageTimings();
	assert.equal(timings.length, 3);
	assert.deepEqual(timings.map(t => t.id), ['frame', 'walls', 'roof']);
	assert.equal(timings[0].visibleAfterMs, 0);
	assert.ok(timings[1].visibleAfterMs > 0 && timings[2].visibleAfterMs > timings[1].visibleAfterMs);
	assert.equal(constructionTotalMs(), CONSTRUCTION_TOTAL_MS);
	assert.equal(CONSTRUCTION_TOTAL_MS, 2400);
});

test('building runtime tracks staged construction per placement', async () => {
	const { createWorldChunkRecord } = await import('../world/streaming/WorldChunkRecord.js');
	const { createWorldChunkId } = await import('../world/streaming/WorldChunkId.js');
	const chunkId = createWorldChunkId({ x: 0, z: 0 });
	const chunks = new Map();
	const items = { 'wood-log': 100 };
	const building = createMitzvahWorldPlayerBuilding({
		inventory: {
			quantity: id => items[id] || 0,
			add: (id, qty) => { items[id] = (items[id] || 0) + qty; },
			remove: (id, qty) => { items[id] -= qty; }
		},
		getChunkRecord: id => {
			if (!chunks.has(id)) chunks.set(id, createWorldChunkRecord({ id }));
			return chunks.get(id);
		},
		putChunkRecord: (id, record) => { chunks.set(id, record); },
		chunkIdFor: () => chunkId,
		heightAt: () => 0,
		nextId: (() => { let n = 0; return () => `bld_t_${n++}`; })()
	});
	building.select('bench');
	building.aimAt(4, 4, 7);
	const committed = building.commit(7);
	assert.equal(committed.ok, true);
	const id = committed.structure.id;
	const startedAt = Date.now();
	assert.equal(building.constructionStageOf(id, startedAt), 0);
	assert.equal(building.constructionStageOf(id, startedAt + 900), 1);
	assert.equal(building.constructionStageOf(id, startedAt + 1700), 2);
	assert.equal(building.constructionStageOf(id, startedAt + 5000), 3);
	assert.equal(building.constructionStageOf('unknown-id'), 3);
	// Ghost preview shapes the aim verdict for the mesh builder.
	building.aimAt(40, 40, 9);
	const preview = building.ghostPreview();
	assert.ok(preview && preview.structureId === 'bench' && preview.valid === true);
	const [ghost] = buildGhostPreview(preview);
	assert.equal(ghost.material.color, 0x2eff7a);
});
