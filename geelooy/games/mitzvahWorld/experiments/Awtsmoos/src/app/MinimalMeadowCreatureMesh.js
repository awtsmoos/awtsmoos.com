// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file MinimalMeadowCreatureMesh.js
	* @description Creates one readable continuous demon surface with an independent skeleton.
	* The Awtsmoos reveals many joints through one body; Awtsmoos.com binds shared textured hide,
	* daylight-safe color, semantic evidence, and one mutable actor material without extra draw calls.
	*/

import { Group, Mesh } from '../../../light-three-gltf/tiny-runtime.js';
import { createCanonicalCreatureSurfaceContract } from '../../../../../../libs/awtsmoos-procedural-core/src/core/animalMesh/creature/canonicalSurfaceContract.js';
import { createMinimalDemonGeometry } from './MinimalMeadowDemonGeometry.js';
import { createMinimalDemonMaterial } from './MinimalMeadowDemonMaterial.js';
import { createMinimalDemonSkeleton } from './MinimalMeadowDemonSkeleton.js';

/**
	* Creates the canonical one-surface demon while preserving all rig and evidence contracts.
	* @param {object} compiled Semantic creature compiler result.
	* @param {object} profile Runtime enemy profile.
	* @param {Document} documentValue Browser document or injected test vessel.
	* @returns {Group} Root carrying exactly one continuous skinned mesh.
	*/
export function createMinimalShadowCreatureMesh(
	compiled,
	profile = {},
	documentValue = globalThis.document
) {
	const root = new Group();
	root.name = `Awtsmoos_continuous_skinned_${profile.id || 'shadow-demon'}`;
	const geometry = createMinimalDemonGeometry();
	const material = createMinimalDemonMaterial(profile, documentValue);
	const mesh = createSurfaceMesh(geometry, material, profile);
	root.add(mesh);
	const rig = createMinimalDemonSkeleton(root);
	mesh.skeleton = rig.skeleton;
	mesh.setBaseTransform();
	const evidence = coreEvidence(compiled, geometry, rig, material);
	root.userData.rig = { ...rig.byName, mesh, root };
	root.userData.proceduralCore = evidence;
	root.userData.skeletons = new Map([[0, rig.skeleton]]);
	root.userData.surfaceMaterial = material.surfaceDiagnostics;
	root.setBaseTransform();
	return root;
}

function createSurfaceMesh(geometry, material, profile) {
	const mesh = new Mesh(geometry, material);
	mesh.name = `Awtsmoos_single_surface_${profile.id || 'demon'}`;
	mesh.skinIndex = 0;
	mesh.isSkinnedMesh = true;
	mesh.frustumCulled = false;
	mesh.userData.bootstrapVisual = true;
	mesh.userData.AwtsmoosDemonSurface = material.surfaceDiagnostics;
	return mesh;
}

function coreEvidence(compiled, geometry, rig, material) {
	const geometryEvidence = geometry.userData.AwtsmoosContinuousDemon;
	const vertices = geometryEvidence.vertexCount;
	const surfaceContract = createCanonicalCreatureSurfaceContract({
		closedSurface: true,
		jointCount: rig.bones.length,
		semanticPartCount: compiled.briah?.body?.parts?.length ||
			compiled.briah?.body?.sections?.length || 0,
		skinWeightCount: geometry.attributes.weights.count,
		vertexCount: vertices
	});
	return {
		anatomyNodes: rig.bones.length,
		artifactType: compiled.artifact?.type || 'asiyah-creature-artifacts',
		bones: rig.bones.length,
		closedSurface: true,
		continuousSkinnedMesh: true,
		material: material.surfaceDiagnostics,
		meshCount: 1,
		surfaceContract,
		triangles: geometryEvidence.triangleCount,
		vertices
	};
}
