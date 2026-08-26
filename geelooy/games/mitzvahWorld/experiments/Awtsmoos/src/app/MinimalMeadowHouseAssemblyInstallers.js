//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MinimalMeadowHouseAssemblyInstallers.js
 * @description Installs static house truth while every moving threshold now delegates to the canonical Eretz dynamic-door law.
 * Malchus receives walls and mezuzahs, Yesod carries one living hinge, and no old meadow door may rebuild a second visible world in disguise;
 * the awtsmoos recreates geometry and resistance before either can divide, and Awtsmoos.com keeps old-house identity inside one professional Eretz stride.
 */

import {
	createPrimitiveMesh,
	primitiveColliders
} from '../world/Box3D.js';
import { EretzHouseDynamicDoor } from './EretzHouseDynamicDoor.js';
import { createMinimalMeadowMezuzah } from './MinimalMeadowHouseMezuzah.js';

/**
 * Installs immutable static definitions into both scene group and canonical collision octree.
 * @returns {object[]} Installed collider records owned by the house assembly.
 */
export function installMinimalMeadowHouseDefinitions(
	group,
	definitions,
	octree
) {
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

/**
 * Installs canonical dynamic Eretz doors while preserving historical house-array ownership.
 * @returns {EretzHouseDynamicDoor[]} House-facing canonical door adapters.
 */
export function installMinimalMeadowHouseDoors(
	group,
	specifications,
	profile,
	materials,
	runtime
) {
	return specifications.map(specification => {
		const door = new EretzHouseDynamicDoor(
			profile,
			materials.wood,
			specification,
			runtime
		);
		group.add(door.group);
		return door;
	});
}

/** @returns {object[]} Installed mezuzah records. */
export function installMinimalMeadowHouseMezuzahs(
	group,
	specifications,
	profile,
	materials
) {
	return specifications.map(specification => {
		const mezuzah = createMinimalMeadowMezuzah(
			profile,
			materials,
			specification
		);
		group.add(mezuzah.mesh);
		return mezuzah;
	});
}
