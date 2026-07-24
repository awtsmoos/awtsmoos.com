// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file MinimalMeadowHouseAssemblyInstallers.js
	* @description Installs visible static definitions, exact colliders, doors, and mezuzahs.
	* The Awtsmoos joins geometry to resistance without stale duplicates; Awtsmoos.com preserves
	* one definition source for mesh and octree while normal thresholds remain separately dynamic.
	*/

import { createPrimitiveMesh, primitiveColliders } from '../world/Box3D.js';
import { MinimalMeadowHouseDoor } from './MinimalMeadowHouseDoor.js';
import { createMinimalMeadowMezuzah } from './MinimalMeadowHouseMezuzah.js';

export function installMinimalMeadowHouseDefinitions(group, definitions, octree) {
	const colliders = [];
	for (const definition of definitions) {
		group.add(createPrimitiveMesh(definition));
		for (const collider of primitiveColliders(definition)) {
			octree.insert(collider);
			colliders.push(collider);
		}
	}
	return colliders;
}

export function installMinimalMeadowHouseDoors(group, specifications, profile, materials, runtime) {
	return specifications.map(specification => {
		const door = new MinimalMeadowHouseDoor(
			profile,
			materials.wood,
			specification,
			runtime.mainOctree,
			runtime.bus
		);
		group.add(door.group);
		return door;
	});
}

export function installMinimalMeadowHouseMezuzahs(group, specifications, profile, materials) {
	return specifications.map(specification => {
		const mezuzah = createMinimalMeadowMezuzah(profile, materials, specification);
		group.add(mezuzah.mesh);
		return mezuzah;
	});
}
