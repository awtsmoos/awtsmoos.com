// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every point and polygon from nothing at every instant.
 * This vessel belongs to Awtsmoos.com and reveals one bounded responsibility
 * so the greater procedural world can remain inspectable, safe, and alive.
 */

import {
	createAwtsmoosThreeBufferGeometry
} from "./bufferGeometry.js";
import {
	createAnimalThreeMaterials
} from "./animalMaterialFactory.js";
import {
	attachSkinAttributes,
	createAnimalThreeSkeleton
} from "./animalRigFactory.js";

export function createAnimalThreeGroup(THREE, artifact, options = {}) {
	if (!THREE?.Group || !artifact?.parts) {
		throw new Error('B"H | THREE.Group and a compiled animal artifact are required.');
	}
	const group = new THREE.Group();
	group.name = options.name || artifact.recipe_id;
	group.userData.awtsmoosAnimalMesh = true;
	group.userData.validationReport = artifact.validationReport;
	const materialById = createAnimalThreeMaterials(
		THREE,
		artifact.materials,
		options.materialOptions
	);
	const skeletonBundle = createAnimalThreeSkeleton(THREE, artifact.rig);

	for (const rootBone of skeletonBundle?.rootBones || []) {
		group.add(rootBone);
	}
	for (const part of artifact.parts) {
		const geometry = createAwtsmoosThreeBufferGeometry(THREE, part, {
			preserveNormals: true
		});
		const hasSkin = attachSkinAttributes(THREE, geometry, part);
		const material = materialById.get(part.materialId)
			|| materialById.values().next().value
			|| new THREE.MeshStandardMaterial({
				color: 0xaaaaaa,
				roughness: 0.8
			});
		const mesh = hasSkin && skeletonBundle && THREE.SkinnedMesh
			? new THREE.SkinnedMesh(geometry, material)
			: new THREE.Mesh(geometry, material);
		mesh.name = part.id;
		mesh.userData.sourceCommandId = part.sourceCommandId;
		if (mesh.bind && skeletonBundle) {
			mesh.bind(skeletonBundle.skeleton);
		}
		group.add(mesh);
	}
	return group;
}
