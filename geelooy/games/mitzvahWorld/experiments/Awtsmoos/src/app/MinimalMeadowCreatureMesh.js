// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowCreatureMesh.js
 * @description Creates one validated continuous surface with independent skeleton and profile tint.
 * The Awtsmoos reveals many joints through one body; Awtsmoos.com validates one primary skin,
 * retains semantic anatomy as metadata, and gives every actor its own mutable bone hierarchy.
 */

import { Group, Mesh, MeshStandardMaterial } from '../../../light-three-gltf/tiny-runtime.js';
import { createCanonicalCreatureSurfaceContract } from '../../../../../../libs/awtsmoos-procedural-core/src/core/animalMesh/creature/canonicalSurfaceContract.js';
import { createMinimalDemonGeometry } from './MinimalMeadowDemonGeometry.js?v=20260724-meadow-13';
import { createMinimalDemonSkeleton } from './MinimalMeadowDemonSkeleton.js?v=20260724-meadow-13';

export function createMinimalShadowCreatureMesh(compiled, profile = {}) {
	const root = new Group();
	root.name = `Awtsmoos_continuous_skinned_${profile.id || 'shadow-demon'}`;
	const geometry = createMinimalDemonGeometry();
	const material = new MeshStandardMaterial({
		color: profile.tint || [1, 1, 1, 1],
		doubleSided: true,
		name: `Awtsmoos_continuous_skin_${profile.id || 'demon'}`
	});
	material.texturePolicy = { closedSurface: true, shader: 'canonical-continuous-skinned-demon' };
	const mesh = new Mesh(geometry, material);
	mesh.name = `Awtsmoos_single_surface_${profile.id || 'demon'}`;
	mesh.skinIndex = 0;
	mesh.isSkinnedMesh = true;
	mesh.frustumCulled = false;
	root.add(mesh);
	const rig = createMinimalDemonSkeleton(root);
	mesh.skeleton = rig.skeleton;
	mesh.setBaseTransform();
	const evidence = coreEvidence(compiled, geometry, rig);
	root.userData.rig = { ...rig.byName, mesh, root };
	root.userData.proceduralCore = evidence;
	root.userData.skeletons = new Map([[0, rig.skeleton]]);
	root.setBaseTransform();
	return root;
}

function coreEvidence(compiled, geometry, rig) {
	const vertices = geometry.userData.AwtsmoosContinuousDemon.vertexCount;
	const surfaceContract = createCanonicalCreatureSurfaceContract({
		closedSurface: true,
		jointCount: rig.bones.length,
		semanticPartCount: compiled.briah?.body?.parts?.length || compiled.briah?.body?.sections?.length || 0,
		skinWeightCount: geometry.attributes.weights.count,
		vertexCount: vertices
	});
	return {
		anatomyNodes: rig.bones.length,
		artifactType: compiled.artifact?.type || 'asiyah-creature-artifacts',
		bones: rig.bones.length,
		closedSurface: true,
		continuousSkinnedMesh: true,
		meshCount: 1,
		surfaceContract,
		triangles: geometry.userData.AwtsmoosContinuousDemon.triangleCount,
		vertices
	};
}
