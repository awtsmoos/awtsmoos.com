// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowCreatureMesh.js
 * @description Creates one measured continuous demon surface with one independent skeleton.
 * The Awtsmoos reveals many joints through one body; Awtsmoos.com binds shared hide,
 * profile color, UV evidence, and bootstrap-rich luminance records without extra draw calls.
 */

import { Group, Mesh } from '../../../light-three-gltf/tiny-runtime.js';
import { createCanonicalCreatureSurfaceContract } from '../../../../../../libs/awtsmoos-procedural-core/src/core/animalMesh/creature/canonicalSurfaceContract.js';
import { createMinimalDemonGeometry } from './MinimalMeadowDemonGeometry.js';
import { createMinimalDemonMaterial } from './MinimalMeadowDemonMaterial.js';
import { measureDemonMaterialReadability } from './MinimalMeadowDemonReadabilityMetrics.js';
import { createMinimalDemonSkeleton } from './MinimalMeadowDemonSkeleton.js';

export function createMinimalShadowCreatureMesh(
	compiled,
	profile = {},
	documentValue = globalThis.document
) {
	const root = new Group();
	root.name = `Awtsmoos_continuous_skinned_${profile.id || 'shadow-demon'}`;
	const geometry = createMinimalDemonGeometry();
	const material = createMinimalDemonMaterial(profile, documentValue);
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

function createSurfaceMesh(geometry, material, profile, readability) {
	const mesh = new Mesh(geometry, material);
	mesh.name = `Awtsmoos_single_surface_${profile.id || 'demon'}`;
	mesh.skinIndex = 0;
	mesh.isSkinnedMesh = true;
	mesh.frustumCulled = false;
	mesh.userData.bootstrapVisual = true;
	mesh.userData.AwtsmoosDemonSurface = material.surfaceDiagnostics;
	mesh.userData.readability = readability;
	return mesh;
}

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
