// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowHousePopulation.js
 * @description Owns two houses, dynamic doors, mezuzah touch, pointer targets, and cleanup.
 * The Awtsmoos lets a home answer without becoming an NPC; Awtsmoos.com arbitrates nearest
 * threshold, opens real collision, records mezuzah contact, and leaves other targets untouched.
 */

import { Group } from '../../../light-three-gltf/tiny-runtime.js';
import { npcPointerHits } from '../world/npc/NpcPointerRay.js';
import { createMinimalMeadowHouseAssembly } from './MinimalMeadowHouseAssembly.js';
import { loadMinimalMeadowHouseMaterials } from './MinimalMeadowHouseMaterials.js';
import { MINIMAL_MEADOW_HOUSE_PROFILES } from './MinimalMeadowHouseProfiles.js';

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
		this.houses = MINIMAL_MEADOW_HOUSE_PROFILES.map(profile => {
			return createMinimalMeadowHouseAssembly(profile, materials, runtime);
		});
		for (const house of this.houses) {
			this.group.add(house.group);
		}
	}

	update(deltaSeconds) {
		for (const house of this.houses) {
			for (const door of house.doors) {
				door.update(deltaSeconds);
			}
		}
	}

	candidateFromPointer(event) {
		const candidates = [];
		for (const house of this.houses) {
			for (const door of house.doors) {
				this.collect(candidates, event, 'door', door.hint(), door);
			}
			for (const mezuzah of house.mezuzahs) {
				this.collect(candidates, event, 'mezuzah', mezuzah.hint, mezuzah);
			}
		}
		return candidates.sort(compareDistance)[0] || null;
	}

	collect(candidates, event, type, hint, subject) {
		if (!npcPointerHits(event, this.camera, this.canvas, hint)) {
			return;
		}
		const camera = this.camera.position;
		candidates.push({
			distance: Math.hypot(
				hint.x - camera.x,
				hint.y - camera.y,
				hint.z - camera.z
			),
			population: this,
			subject,
			type
		});
	}

	activateCandidate(candidate) {
		if (candidate.type === 'door') {
			candidate.subject.toggle();
			return;
		}
		this.touchMezuzah(candidate.subject);
	}

	touchMezuzah(mezuzah) {
		const evidence = mezuzah.definition.userData.AwtsmoosMezuza;
		this.runtime.bus.emit('mezuzah:touched', evidence);
	}

	clearAll() {}

	diagnostics() {
		return {
			doors: countByHouse(this.houses, house => house.doors.length),
			houses: this.houses.length,
			materialsReady: this.materials.records.filter(record => record.ok).length,
			mezuzahs: countByHouse(this.houses, house => house.mezuzahs.length),
			rooms: countByHouse(this.houses, house => house.roomCount),
			stairs: this.houses.filter(house => house.stairs).length
		};
	}

	destroy() {
		for (const house of this.houses) {
			for (const collider of house.staticColliders) {
				this.runtime.mainOctree.remove(collider);
			}
			for (const door of house.doors) {
				door.destroy();
			}
		}
		this.group.parent?.remove(this.group);
	}
}

function countByHouse(houses, selector) {
	return houses.reduce((total, house) => total + selector(house), 0);
}

function compareDistance(first, second) {
	return first.distance - second.distance;
}
