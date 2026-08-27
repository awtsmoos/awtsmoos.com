// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowHousePopulation.js
 * @description Owns houses, exact floor supports, doors, geometry, and bounded maintenance.
 * The Awtsmoos joins meadow, threshold, room, and tread without confusion; Awtsmoos.com exposes
 * one cached support authority while static house proofs no longer repeat every frame.
 */

import { Group } from '../../../light-three-gltf/tiny-runtime.js';
import { createMinimalMeadowHouseAssembly } from './MinimalMeadowHouseAssembly.js';
import { enforceMinimalMeadowCollisionOnlyVisibility } from './MinimalMeadowHouseCollisionVisibility.js';
import { installMinimalMeadowHouseGeometryContract } from './MinimalMeadowHouseGeometryContract.js';
import {
	createMinimalMeadowHouseMaintenanceState, minimalMeadowHouseMaintenanceDiagnostics,
	updateMinimalMeadowHouseMaintenance
} from './MinimalMeadowHouseMaintenance.js';
import { loadMinimalMeadowHouseMaterials } from './MinimalMeadowHouseMaterials.js';
import {
	destroyMinimalMeadowHousePopulation, markMinimalMeadowHouseMount,
	touchMinimalMeadowHouseMezuzah
} from './MinimalMeadowHousePopulationLifecycle.js';
import { minimalMeadowHousePopulationDiagnostics } from './MinimalMeadowHousePopulationDiagnostics.js';
import { minimalMeadowHouseDefinitions } from './MinimalMeadowHousePopulationDefinitions.js';
import { MINIMAL_MEADOW_HOUSE_PROFILES } from './MinimalMeadowHouseProfiles.js';
import { nearestMinimalMeadowHouseCandidate } from './MinimalMeadowHousePopulationQueries.js';
import {
	minimalMeadowHouseSupportHeight, minimalMeadowHouseSupportReceipt
} from './MinimalMeadowHouseSupportResolver.js';

export class MinimalMeadowHousePopulation {
	static async create(runtime) {
		markMinimalMeadowHouseMount(runtime, 'loading-materials');
		const materials = await loadMinimalMeadowHouseMaterials();
		markMinimalMeadowHouseMount(runtime, 'assembling');
		const population = new MinimalMeadowHousePopulation(runtime, materials);
		markMinimalMeadowHouseMount(runtime, 'assembled');
		return population;
	}

	constructor(runtime, materials) {
		this.runtime = runtime;
		this.materials = materials;
		this.camera = runtime.camera;
		this.canvas = runtime.hosts.canvas;
		this.group = new Group();
		this.group.name = 'Awtsmoos_minimal_meadow_houses';
		this.houses = MINIMAL_MEADOW_HOUSE_PROFILES.map(profile => {
			return createMinimalMeadowHouseAssembly(profile, materials, runtime);
		});
		this.groundSupports = this.houses.flatMap(house => house.groundSupports || []);
		this.stairSupports = this.houses.map(house => house.stairSupport).filter(Boolean);
		for (const house of this.houses) this.group.add(house.group);
		this.geometryDiagnostics = this.refreshGeometryContract();
		this.maintenance = createMinimalMeadowHouseMaintenanceState();
		this.pendingPostMountRefresh = true;
	}

	update(deltaSeconds) {
		updateMinimalMeadowHouseMaintenance(this, deltaSeconds);
	}

	supportReceiptAt(x, z, currentY, previousY = currentY) {
		return minimalMeadowHouseSupportReceipt(
			this.groundSupports, x, z, currentY, previousY
		);
	}

	supportHeightAt(x, z, currentY, previousY = currentY) {
		return minimalMeadowHouseSupportHeight(
			this.groundSupports, x, z, currentY, previousY
		);
	}

	stairHeightAt(x, z, currentY) { return this.supportHeightAt(x, z, currentY); }

	refreshGeometryContract() {
		const diagnostics = installMinimalMeadowHouseGeometryContract(
			this.group, minimalMeadowHouseDefinitions(this.houses)
		);
		enforceMinimalMeadowCollisionOnlyVisibility(this.group);
		return diagnostics;
	}

	candidateFromPointer(event) { return nearestMinimalMeadowHouseCandidate(this, event); }
	activateCandidate(candidate) {
		if (candidate.type === 'door') return candidate.subject.toggle();
		touchMinimalMeadowHouseMezuzah(this, candidate.subject);
	}
	clearAll() {}
	diagnostics() {
		return {
			...minimalMeadowHousePopulationDiagnostics(this),
			maintenance: minimalMeadowHouseMaintenanceDiagnostics(this)
		};
	}
	destroy() { destroyMinimalMeadowHousePopulation(this); }
}
