// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file InstancedGrassField.js
 * @description Converts the ecological grass placement plan into GPU-instanced draws.
 * The Awtsmoos does not rebuild the meadow for every blade; Awtsmoos.com keeps one
 * canonical tuft geometry per habitat profile and streams one matrix per placement,
 * so thousands of tufts cost a few instanced draw calls instead of one giant merged
 * vertex sea. The merged CPU geometry remains the honest fallback where the GPU
 * cannot instance.
 */

import { createNativeGeometry } from '../../../../../../../libs/awtsmoos-procedural-core/src/core/worldBuilding/index.js';
import { appendYardGrassTuft } from './YardGrassMeshBuilder.js';
import { createEcologicalYardGrassTuft } from './EcologicalYardGrassTuft.js';
import { yardGrassRandom } from './YardGrassTuftProfile.js';
import { createPrimitiveGeometryData } from '../primitives/PrimitiveGeometryFactory.js';
import {
	createPrimitiveVertexNormals,
	flattenPrimitiveVertices,
	primitiveColorArray,
	primitiveIndexArray
} from '../primitives/PrimitiveGeometryBuffers.js';

const TAU = Math.PI * 2;
const CANONICAL_SEED_BASE = 4000;

/**
 * Builds one instanced variant per habitat profile from an ecology plan.
 * Each variant is renderer-ready: { geometry, userData: { instanced } }.
 */
export function createInstancedGrassVariants(plan, quality = 'high') {
	const placements = plan?.placements || [];
	if (!placements.length) return [];
	const byProfile = new Map();
	placements.forEach((placement, index) => {
		const profile = placement?.profile || 'meadow-fescue';
		if (!byProfile.has(profile)) byProfile.set(profile, []);
		byProfile.get(profile).push({ index, placement });
	});
	const variants = [];
	let profileIndex = 0;
	for (const [profile, members] of byProfile) {
		const geometry = canonicalTuftGeometry(profile, CANONICAL_SEED_BASE + profileIndex);
		if (!geometry) continue;
		const matrices = new Float32Array(members.length * 16);
		members.forEach(({ index, placement }, slot) => {
			writeInstanceMatrix(
				matrices,
				slot * 16,
				placement,
				yardGrassRandom(index + 613, 911) * TAU
			);
		});
		variants.push(Object.freeze({
			geometry,
			profile,
			userData: Object.freeze({
				instanced: Object.freeze({
					count: members.length,
					matrices,
					revision: 1
				})
			})
		}));
		profileIndex += 1;
	}
	return Object.freeze(variants);
}

/** Builds one canonical tuft geometry at the origin for a habitat profile. */
function canonicalTuftGeometry(profile, seed) {
	const tuftMesh = { faces: [], uvs: [], vertices: [] };
	const tuft = createEcologicalYardGrassTuft(seed, {
		position: { x: 0, y: 0, z: 0 },
		profile,
		scale: 1
	});
	appendYardGrassTuft(tuftMesh, tuft);
	if (!tuftMesh.vertices.length || !tuftMesh.faces.length) return null;
	// Same geometry pipeline as the merged grass mesh, so instanced blades
	// shade identically to the fallback.
	const sourceData = createPrimitiveGeometryData({
		color: '#5d9f42',
		faces: tuftMesh.faces,
		shape: 'manual',
		uvs: tuftMesh.uvs,
		vertices: tuftMesh.vertices
	});
	const normals = createPrimitiveVertexNormals(sourceData);
	return createNativeGeometry({
		colors: primitiveColorArray(sourceData.colors, sourceData.vertices.length),
		indices: primitiveIndexArray(sourceData.indices),
		normals: new Float32Array(normals),
		positions: new Float32Array(flattenPrimitiveVertices(sourceData.vertices)),
		uvs: new Float32Array(sourceData.uvs)
	});
}

/** Writes T(position) * Ry(yaw) * S(scale) column-major into the matrix array. */
function writeInstanceMatrix(matrices, offset, placement, yaw) {
	const position = placement?.position || { x: 0, y: 0, z: 0 };
	const scale = Math.max(0.05, Number(placement?.scale) || 1);
	const cosine = Math.cos(yaw) * scale;
	const sine = Math.sin(yaw) * scale;
	matrices[offset] = cosine;
	matrices[offset + 1] = 0;
	matrices[offset + 2] = -sine;
	matrices[offset + 3] = 0;
	matrices[offset + 4] = 0;
	matrices[offset + 5] = scale;
	matrices[offset + 6] = 0;
	matrices[offset + 7] = 0;
	matrices[offset + 8] = sine;
	matrices[offset + 9] = 0;
	matrices[offset + 10] = cosine;
	matrices[offset + 11] = 0;
	matrices[offset + 12] = Number(position.x) || 0;
	matrices[offset + 13] = Number(position.y) || 0;
	matrices[offset + 14] = Number(position.z) || 0;
	matrices[offset + 15] = 1;
}
