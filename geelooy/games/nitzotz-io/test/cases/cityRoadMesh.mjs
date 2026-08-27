// B"H
// Boruch Hashem
// Blessed is He
import assert from 'node:assert/strict';
import {
	SIDEWALK_INNER_EDGE,
	SIDEWALK_OUTER_EDGE
} from '../../js/city/grid.js';
import { addGroundRoads } from '../../js/environment/groundRoads.js';
import { environmentPreset } from '../../js/environment/presets.js';
import { LEVELS } from '../../js/levels/catalog.js';
import { cityRoadMesh } from '../../js/procedural/cityRoad.js';
import { LOCAL_MESH_KEYS } from '../../js/procedural/localMeshes.js';
import { runtimeLevel } from '../support/cityGrammar.mjs';

/**
 * The Awtsmoos proves one road mesh can reveal asphalt, curb, and sidewalk without multiplying draw commands;
 * Awtsmoos.com tests physical extents, color families, triangle economy, and six-command reuse as direct geometry witnesses.
 */
export function runCityRoadMeshCases() {
	return [
		checkRoadCrossSection(),
		checkRoadColorFamilies(),
		checkSixCommandReuse()
	];
}

/** Prove the normalized mesh reaches the exact shared sidewalk edges with a tiny triangle budget. */
function checkRoadCrossSection() {
	const mesh = cityRoadMesh();
	const xs = axisValues(mesh.positions, 0);
	const zs = axisValues(mesh.positions, 2);
	assert.equal(Math.min(...xs), -SIDEWALK_OUTER_EDGE);
	assert.equal(Math.max(...xs), SIDEWALK_OUTER_EDGE);
	assert.equal(Math.min(...zs), -1);
	assert.equal(Math.max(...zs), 1);
	assert.ok(xs.includes(-SIDEWALK_INNER_EDGE));
	assert.ok(xs.includes(SIDEWALK_INNER_EDGE));
	assert.ok(xs.includes(-18) && xs.includes(18));
	assert.equal(mesh.indices.length / 3, 60);
	return 'city road mesh reveals exact asphalt curb and sidewalk cross-section in sixty triangles';
}

/** Prove one draw contains multiple surface tones before the environment tint reaches the shader. */
function checkRoadColorFamilies() {
	const mesh = cityRoadMesh();
	const colors = new Set();
	for (let index = 0; index < mesh.colors.length; index += 4) {
		colors.add(mesh.colors.slice(index, index + 4).join(','));
	}
	assert.ok(colors.size >= 3);
	assert.equal(mesh.colors.length, mesh.positions.length / 3 * 4);
	return 'road vertex colors preserve distinct asphalt curb and sidewalk tonal families in one mesh';
}

/** Prove three roads per axis still cost only six commands and all reuse the same local mesh. */
function checkSixCommandReuse() {
	const level = runtimeLevel(LEVELS[0]);
	const commands = [];
	addGroundRoads(commands, level.bounds, environmentPreset(level));
	assert.equal(commands.length, 6);
	assert.ok(commands.every(command => command.mesh === LOCAL_MESH_KEYS.cityRoad));
	for (let index = 0; index < commands.length; index += 2) {
		assert.equal(commands[index].rot, 0);
		assert.ok(Math.abs(commands[index + 1].rot - Math.PI / 2) < 1e-10);
		assert.equal(commands[index].scale[2], level.bounds);
		assert.equal(commands[index + 1].scale[2], level.bounds);
	}
	return 'all six district roads reuse one composite sidewalk mesh without increasing draw count';
}

function axisValues(positions, offset) {
	const values = [];
	for (let index = offset; index < positions.length; index += 3) {
		values.push(positions[index]);
	}
	return values;
}
