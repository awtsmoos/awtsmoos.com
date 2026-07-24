// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file 05_PRECHANGE_ORBIT_AUDIT.mjs
 * @description Measures the house contract before repair without changing production code.
 * The Awtsmoos reveals absence as evidence; Awtsmoos.com circles every finite home while
 * winding, matrices, explicit bounds, side ownership, and renderer eligibility testify.
 */

import { Group, PerspectiveCamera } from '../../experiments/light-three-gltf/tiny-runtime.js';
import { collectMeshes } from '../../experiments/light-three-gltf/tiny-render-draw-list.js';
import { collectWorldMatrices } from '../../experiments/light-three-gltf/tiny-skin-scene.js';
import { createMinimalMeadowHouseFoundation } from '../../experiments/Awtsmoos/src/app/MinimalMeadowHouseFoundation.js';
import { createMinimalMeadowHouseRooms } from '../../experiments/Awtsmoos/src/app/MinimalMeadowHouseRooms.js';
import { createMinimalMeadowHouseShell } from '../../experiments/Awtsmoos/src/app/MinimalMeadowHouseShell.js';
import { createMinimalMeadowHouseStairs } from '../../experiments/Awtsmoos/src/app/MinimalMeadowHouseStairs.js';
import { MINIMAL_MEADOW_HOUSE_PROFILES } from '../../experiments/Awtsmoos/src/app/MinimalMeadowHouseProfiles.js';
import { createPrimitiveMesh } from '../../experiments/Awtsmoos/src/world/Box3D.js';

const materials = Object.freeze({
	brick: Object.freeze({ color: '#8b4a38' }),
	brickLight: Object.freeze({ color: '#d0b08f' }),
	floor: Object.freeze({ color: '#817463' }),
	glass: Object.freeze({ color: '#aaccee', transparent: true }),
	roof: Object.freeze({ color: '#743a32' }),
	wood: Object.freeze({ color: '#6c4428' })
});
const terrain = (x, z) => Math.sin(x * 0.025) * 2.4 + Math.cos(z * 0.021) * 1.8;
const report = [];
for (const profile of MINIMAL_MEADOW_HOUSE_PROFILES) report.push(auditHouse(profile));
console.log(JSON.stringify(report, null, 2));
if (report.some(item => item.missingBounds || item.missingSidePolicy || item.missingDefinitions)) {
	process.exitCode = 1;
}

function auditHouse(profile) {
	const foundation = createMinimalMeadowHouseFoundation(profile, materials, terrain);
	const rooms = createMinimalMeadowHouseRooms(profile, materials, foundation.groundY);
	const definitions = [
		...foundation.definitions,
		...createMinimalMeadowHouseShell(profile, materials, foundation.groundY),
		...rooms.definitions,
		...createMinimalMeadowHouseStairs(profile, materials, foundation.groundY).definitions
	];
	const root = new Group();
	const meshes = definitions.map(definition => createPrimitiveMesh(definition));
	for (const mesh of meshes) root.add(mesh);
	collectWorldMatrices(root);
	return {
		drawFailures: orbitFailures(root, meshes, profile, foundation.groundY),
		houseId: profile.id,
		matrixFailures: meshes.filter(mesh => determinant(mesh.matrixWorld) <= 0).length,
		missingBounds: meshes.filter(mesh => !mesh.geometry.boundingBox || !mesh.geometry.boundingSphere).length,
		missingDefinitions: meshes.filter(mesh => !mesh.userData.AwtsmoosWorldModel?.definition).length,
		missingSidePolicy: meshes.filter(mesh => (
			typeof mesh.material.doubleSided !== 'boolean'
			|| typeof mesh.material.backfaceCull !== 'boolean'
		)).length,
		meshCount: meshes.length,
		windingFailures: definitions.reduce((sum, definition, index) => (
			sum + windingFailures(meshes[index], definition)
		), 0)
	};
}

function orbitFailures(root, meshes, profile, groundY) {
	const camera = new PerspectiveCamera(70, 1.6, 0.1, 2000);
	const radius = Math.hypot(profile.width, profile.depth) * 2.5;
	const elevations = [groundY - 8, groundY + 1.7, groundY + profile.wallHeight + 4, groundY + 70];
	let failures = 0;
	for (const elevation of elevations) {
		for (let step = 0; step < 24; step += 1) {
			const angle = step * Math.PI / 12;
			camera.position.set(profile.x + Math.cos(angle) * radius, elevation, profile.z + Math.sin(angle) * radius);
			camera.target = [profile.x, groundY + profile.wallHeight / 2, profile.z];
			collectWorldMatrices(root);
			const list = collectMeshes(root, camera, { defaultRenderDistance: 2000, distanceScale: 1 });
			const drawn = new Set([...list.opaque, ...list.transparent]);
			failures += meshes.filter(mesh => !drawn.has(mesh)).length;
		}
	}
	return failures;
}

function windingFailures(mesh, definition) {
	const position = mesh.geometry.attributes.position.array;
	const indices = mesh.geometry.index.array;
	let failures = 0;
	for (let offset = 0; offset < indices.length; offset += 3) {
		const a = point(position, indices[offset]);
		const b = point(position, indices[offset + 1]);
		const c = point(position, indices[offset + 2]);
		const normal = cross(subtract(b, a), subtract(c, a));
		const center = scale(add(add(a, b), c), 1 / 3);
		if (dot(normal, subtract(center, definition.position)) <= 0) failures += 1;
	}
	return failures;
}

function point(array, index) { return { x: array[index * 3], y: array[index * 3 + 1], z: array[index * 3 + 2] }; }
function add(a, b) { return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z }; }
function subtract(a, b) { return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z }; }
function scale(a, value) { return { x: a.x * value, y: a.y * value, z: a.z * value }; }
function dot(a, b) { return a.x * b.x + a.y * b.y + a.z * b.z; }
function cross(a, b) { return { x: a.y * b.z - a.z * b.y, y: a.z * b.x - a.x * b.z, z: a.x * b.y - a.y * b.x }; }
function determinant(m) { return m[0] * (m[5] * m[10] - m[6] * m[9]) - m[4] * (m[1] * m[10] - m[2] * m[9]) + m[8] * (m[1] * m[6] - m[2] * m[5]); }
