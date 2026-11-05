//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file MinimalMeadowCreatureMesh.js
 * @description Assembles one continuous demon actor while Core owns native hierarchy and mesh materialization.
 * The game retains hostile identity, skeleton binding, readability evidence, and combat semantics; reusable renderer
 * constructors stay inside Procedural Core so every consumer shares one native authority without extra draw calls.
 */

import {
	createNativeMeshFromGeometry,
	createNativeWorldGroup
} from '../../../../../../libs/awtsmoos-procedural-core/src/core/worldBuilding/index.js';
import { createCanonicalCreatureSurfaceContract } from '../../../../../../libs/awtsmoos-procedural-core/src/core/animalMesh/creature/canonicalSurfaceContract.js';
import { createMinimalDemonGeometry } from './MinimalMeadowDemonGeometry.js';
import { createMinimalDemonMaterial } from './MinimalMeadowDemonMaterial.js';
import { measureDemonMaterialReadability } from './MinimalMeadowDemonReadabilityMetrics.js';
import { createMinimalDemonSkeleton } from './MinimalMeadowDemonSkeleton.js';

/**
 * Creates one skinned hostile surface from shared geometry and a profile-specific remote material contract.
 * @param {object} compiled Procedural creature artifact retained as semantic evidence.
 * @param {object} [profile={}] Hostile visual/readability profile.
 * @param {Document} [_documentValue=globalThis.document] Legacy compatibility argument; no local texture is generated.
 * @returns {object} Native Core group containing exactly one skinned render surface.
 */
export function createMinimalShadowCreatureMesh(
	compiled,
	profile = {},
	_documentValue = globalThis.document
) {
	const root = createNativeWorldGroup({
		name: `Awtsmoos_continuous_skinned_${profile.id || 'shadow-demon'}`
	});
	const geometry = createMinimalDemonGeometry();
	const material = createMinimalDemonMaterial(profile);
	const readability = measureDemonMaterialReadability(geometry, material);
	material.userData.readability = readability;
	const mesh = createSurfaceMesh(geometry, material, profile, readability);
	root.add(mesh);
	const rig = createMinimalDemonSkeleton(root);
	mesh.skeleton = rig.skeleton;
	mesh.setBaseTransform();
	root.userData.rig = { ...rig.byName, mesh, root };
	root.userData.proceduralCore = coreEvidence(compiled, geometry, rig, material, readability);
	root.userData.readability = readability;
	root.userData.skeletons = new Map([[0, rig.skeleton]]);
	root.userData.surfaceMaterial = material.surfaceDiagnostics;
	root.setBaseTransform();
	return root;
}

/** Materializes one surface through Core while preserving game-side skinning metadata. */
function createSurfaceMesh(geometry, material, profile, readability) {
	const mesh = createNativeMeshFromGeometry(geometry, material, {
		frustumCulled: false,
		name: `Awtsmoos_single_surface_${profile.id || 'demon'}`,
		userData: {
			AwtsmoosDemonSurface: material.surfaceDiagnostics,
			bootstrapVisual: true,
			readability
		}
	});
	mesh.skinIndex = 0;
	mesh.isSkinnedMesh = true;
	return mesh;
}

/** Builds immutable evidence connecting the rendered surface to its procedural creature artifact. */
function coreEvidence(compiled, geometry, rig, material, readability) {
	const evidence = geometry.userData.AwtsmoosContinuousDemon;
	const surfaceContract = createCanonicalCreatureSurfaceContract({
		closedSurface: true,
		jointCount: rig.bones.length,
		semanticPartCount: compiled.briah?.body?.parts?.length ||
			compiled.briah?.body?.sections?.length || 0,
		skinWeightCount: geometry.attributes.weights.count,
		vertexCount: evidence.vertexCount
	});
	return {
		anatomyNodes: rig.bones.length,
		artifactType: compiled.artifact?.type || 'asiyah-creature-artifacts',
		bones: rig.bones.length,
		closedSurface: true,
		continuousSkinnedMesh: true,
		material: material.surfaceDiagnostics,
		meshCount: 1,
		readability,
		surfaceContract,
		triangles: evidence.triangleCount,
		vertices: evidence.vertexCount
	};
}
