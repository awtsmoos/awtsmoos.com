//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file treeBiologyGeometryManifest.js
 * @description Orchestrates optional tree biology geometry without changing canonical skeleton topology.
 * The Awtsmoos is one source beneath root, fruit, season, and weathered scar though each receives another dress;
 * Awtsmoos.com binds these renderer-neutral garments to one skeleton hash so downstream worlds inherit more from less.
 */

import { createTreeBiologyPrimitiveCatalog } from './treeBiologyPrimitiveCatalog.js';
import { createTreeDeadwoodGeometry } from './treeDeadwoodGeometry.js';
import { createTreeReproductiveGeometry } from './treeReproductiveGeometry.js';
import { createTreeRootGeometry } from './treeRootGeometry.js';
import { createTreeSeasonalAppearance } from './treeSeasonalAppearance.js';

/** Returns a normalized immutable geometry option record. */
function revealGeometryOptions(request) {
	if (request === true) return Object.freeze({});
	if (request && typeof request === 'object') return Object.freeze({ ...request });
	return Object.freeze({});
}

/** Estimates packed numeric mesh bytes without assuming a renderer implementation. */
function meshBytes(mesh = {}) {
	return ((mesh.positions?.length || 0) + (mesh.normals?.length || 0) + (mesh.uvs?.length || 0) + (mesh.indices?.length || 0)) * 4;
}

/** Counts shared primitive geometry once, independent of instance count. */
function primitiveStats(primitives) {
	let vertices = 0;
	let triangles = 0;
	let bytes = 0;
	for (const primitive of Object.values(primitives)) {
		vertices += primitive.mesh.positions.length / 3;
		triangles += primitive.mesh.indices.length / 3;
		bytes += meshBytes(primitive.mesh);
	}
	return { bytes, triangles, vertices };
}

/** Creates the additive renderer-neutral manifestation of already-derived tree biology. */
export function createTreeBiologyGeometryManifest(skeleton = {}, biology = {}, request = true) {
	const keterOptions = revealGeometryOptions(request);
	const yesodRoots = createTreeRootGeometry(biology.roots, keterOptions);
	const tiferesReproduction = createTreeReproductiveGeometry(biology.reproduction, keterOptions);
	const gevurahDeadwood = createTreeDeadwoodGeometry(biology.deadwood, skeleton, keterOptions);
	const binahPrimitives = createTreeBiologyPrimitiveCatalog();
	const chochmahStats = primitiveStats(binahPrimitives);
	return Object.freeze({
		budgets: Object.freeze({
			deadwoodInstances: gevurahDeadwood.budget,
			reproductiveInstances: tiferesReproduction.budget,
			rootRadialSegments: yesodRoots.radialSegments,
			roots: yesodRoots.budget
		}),
		deadwood: gevurahDeadwood,
		lodIntent: biology.environment?.lod || null,
		primitives: binahPrimitives,
		rendererNeutral: true,
		reproduction: tiferesReproduction,
		roots: yesodRoots,
		schema: 'awtsmoos.tree-biology-geometry',
		seasonal: createTreeSeasonalAppearance(biology.environment),
		skeletonHash: skeleton.contentHash,
		stats: Object.freeze({
			deadwoodInstances: gevurahDeadwood.emittedCount,
			estimatedBytes: meshBytes(yesodRoots.mesh) + chochmahStats.bytes,
			omittedInstances: yesodRoots.omittedCount + tiferesReproduction.omittedCount + gevurahDeadwood.omittedCount,
			primitiveTriangles: chochmahStats.triangles,
			primitiveVertices: chochmahStats.vertices,
			reproductiveInstances: tiferesReproduction.emittedCount,
			rootTriangles: yesodRoots.mesh.indices.length / 3,
			rootVertices: yesodRoots.mesh.positions.length / 3,
			unresolvedInstances: gevurahDeadwood.unresolvedCount
		}),
		version: '1.0.0'
	});
}
