// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowHousePopulation.js
 * @description Owns houses while renewing their local geometry visibility contract.
 * The Awtsmoos joins door, wall, bounds, selection, and collision without confusion;
 * Awtsmoos.com repairs each rebuilt threshold and never disables renderer culling globally.
 */

import { Group } from '../../../light-three-gltf/tiny-runtime.js';
import { createMinimalMeadowHouseAssembly } from './MinimalMeadowHouseAssembly.js';
import { installMinimalMeadowHouseGeometryContract } from './MinimalMeadowHouseGeometryContract.js';
import { loadMinimalMeadowHouseMaterials } from './MinimalMeadowHouseMaterials.js';
import { minimalMeadowHousePopulationDiagnostics } from './MinimalMeadowHousePopulationDiagnostics.js';
import { minimalMeadowHouseDefinitions } from './MinimalMeadowHousePopulationDefinitions.js';
import { MINIMAL_MEADOW_HOUSE_PROFILES } from './MinimalMeadowHouseProfiles.js';
import { nearestMinimalMeadowHouseCandidate } from './MinimalMeadowHousePopulationQueries.js';

export class MinimalMeadowHousePopulation {
	static async create(runtime) {
		const materials = await loadMinimalMeadowHouseMaterials();
		return new MinimalMeadowHousePopulation(runtime, materials);
	}

	constructor(runtime, materials) {
		this.runtime = runtime;
		this.materials = materials;
		this.camera = runtime.camera;
		this.canvas = runtime.hosts.canvas;
		this.group = new Group();
		this.group.name = 'Awtsmoos_minimal_meadow_houses';
		this.houses = MINIMAL_MEADOW_HOUSE_PROFILES.map(profile => (
			createMinimalMeadowHouseAssembly(profile, materials, runtime)
		));
		for (const house of this.houses) this.group.add(house.group);
		this.geometryDiagnostics = this.refreshGeometryContract();
		this.pendingPostMountRefresh = true;
	}

	update(deltaSeconds) {
		for (const house of this.houses) {
			for (const door of house.doors) door.update(deltaSeconds);
		}
		if (this.pendingPostMountRefresh) {
			this.geometryDiagnostics = this.refreshGeometryContract();
			this.pendingPostMountRefresh = false;
			return;
		}
		for (const house of this.houses) {
			for (const door of house.doors) {
				installMinimalMeadowHouseGeometryContract(door.group, [door.definition()]);
			}
		}
	}

	refreshGeometryContract() {
		return installMinimalMeadowHouseGeometryContract(
			this.group,
			minimalMeadowHouseDefinitions(this.houses)
		);
	}

	candidateFromPointer(event) {
		return nearestMinimalMeadowHouseCandidate(this, event);
	}

	activateCandidate(candidate) {
		if (candidate.type === 'door') {
			candidate.subject.toggle();
			return;
		}
		this.touchMezuzah(candidate.subject);
	}

	touchMezuzah(mezuzah) {
		this.runtime.bus.emit(
			'mezuzah:touched',
			mezuzah.definition.userData.AwtsmoosMezuza
		);
	}

	clearAll() {}

	diagnostics() {
		return minimalMeadowHousePopulationDiagnostics(this);
	}

	destroy() {
		for (const house of this.houses) {
			for (const collider of house.staticColliders) {
				this.runtime.mainOctree.remove(collider);
			}
			for (const door of house.doors) door.destroy();
		}
		this.group.parent?.remove(this.group);
	}
}
