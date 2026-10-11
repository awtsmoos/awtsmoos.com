// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldBuildingMeshes.test.mjs
 * @description Guards the building mesh contract: every buildable structure draws
 * hand-tuned pieces, piece ids are unique, shapes are known, and nothing overhangs
 * the structure's own collision box.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	BUILDABLE_STRUCTURES,
	buildableStructureIds
} from './MitzvahWorldPlayerBuilding.js';
import {
	buildStructureMeshes,
	meshesForChunkRecord,
	meshedStructureIds,
	meshPieceCount
} from './MitzvahWorldBuildingMeshes.js';
import {
	applyWorldChunkMutation,
	createWorldChunkRecord
} from '../world/streaming/WorldChunkRecord.js';
import { createWorldChunkId } from '../world/streaming/WorldChunkId.js';

function placed(id, x = 10, z = 20, y = 5) {
	const definition = BUILDABLE_STRUCTURES[id];
	return {
		id: `bld_probe_${id.replaceAll('-', '_')}`,
		structureId: id,
		x, y, z,
		radius: definition.radius,
		height: definition.height
	};
}

test('every buildable structure has a hand-tuned mesh builder', () => {
	const meshed = meshedStructureIds();
	for (const id of buildableStructureIds()) {
		assert.ok(meshed.includes(id), `${id} needs a mesh builder`);
		assert.ok(meshPieceCount(id) >= 1, `${id} must draw at least one piece`);
	}
});

test('mesh pieces fit inside the structure collision box and carry world positions', () => {
	for (const id of buildableStructureIds()) {
		const structure = placed(id);
		const pieces = buildStructureMeshes(structure);
		assert.ok(pieces.length >= 1, `${id} draws pieces`);
		const seen = new Set();
		for (const piece of pieces) {
			assert.ok(!seen.has(piece.id), `${id} piece ids are unique`);
			seen.add(piece.id);
			assert.ok(['box', 'cylinder'].includes(piece.shape), `${id} uses a known shape`);
			// World position = structure position + local offset.
			assert.equal(piece.position.x, structure.x + piece.local.x);
			assert.equal(piece.position.y, structure.y + piece.local.y);
			assert.equal(piece.position.z, structure.z + piece.local.z);
			// Horizontal footprint must stay inside the same axis-aligned collision box
			// boxOf() registers (half-extent = radius), plus a small eave tolerance.
			const eave = 0.35;
			if (piece.shape === 'cylinder') {
				const reach = Math.hypot(piece.local.x, piece.local.z) + piece.size.radius;
				assert.ok(
					reach <= structure.radius + eave,
					`${id} piece ${piece.id} overhangs the collision radius (reach ${reach.toFixed(2)} > ${structure.radius})`
				);
			} else {
				assert.ok(
					Math.abs(piece.local.x) + piece.size.x / 2 <= structure.radius + eave,
					`${id} piece ${piece.id} overhangs the collision box on x`
				);
				assert.ok(
					Math.abs(piece.local.z) + piece.size.z / 2 <= structure.radius + eave,
					`${id} piece ${piece.id} overhangs the collision box on z`
				);
			}
			// Nothing towers far above the structure height (horns and caps may crown slightly).
			const halfY = piece.shape === 'cylinder' ? piece.size.height / 2 : piece.size.y / 2;
			const top = piece.local.y + halfY;
			assert.ok(
				top <= structure.height + 0.3,
				`${id} piece ${piece.id} towers above the height (top ${top.toFixed(2)} > ${structure.height})`
			);
			assert.ok(piece.material && typeof piece.material.color === 'number', `${id} piece has a material color`);
		}
	}
});

test('menorah stand draws seven flames and shulchan carries the bread', () => {
	const flames = buildStructureMeshes(placed('menorah-stand')).filter(p => p.id.includes('flame'));
	assert.equal(flames.length, 7, 'seven branches, seven flames');
	const breads = buildStructureMeshes(placed('shulchan')).filter(p => p.id.includes('bread'));
	assert.equal(breads.length, 2, 'two showbread stacks');
});

test('meshesForChunkRecord collects pieces for stored structures', () => {
	const record = createWorldChunkRecord({ id: createWorldChunkId({ x: 0, z: 0 }) });
	const withBuildings = applyWorldChunkMutation(record, 'player-buildings', [
		placed('mizbeach', 1, 2, 0),
		placed('well', 30, 40, 1)
	]);
	const pieces = meshesForChunkRecord(withBuildings);
	assert.ok(pieces.length >= meshPieceCount('mizbeach') + meshPieceCount('well'));
	const byId = new Set(pieces.map(p => p.id));
	assert.equal(byId.size, pieces.length, 'piece ids stay unique across structures');
});
