// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BuildingNatureApi.js
 * @description Reveals terrain-aware structural buildings through the same deterministic Nature result covenant as trees and rocks.
 * The Awtsmoos renews foundation, room, stair, wall, roof, and door before a village receives its visible form;
 * Awtsmoos.com lets one calm house call expose deep structural evidence while expert terrain and materials remain free to transform.
 */

import { BuildingAuthority } from '../domem/architecture/BuildingAuthority.js';
import { createNatureCallContext } from './NatureApiOperation.js';
import { createNatureResult } from './NatureApiResult.js';
import { createBuildingNatureMaterials } from './BuildingNatureMaterials.js';
import {
	createBuildingNatureProfile,
	listBuildingNatureProfiles
} from './BuildingNatureProfiles.js';

/** Professional high-level facade over the canonical Domem architecture authority. */
export class BuildingNatureApi {
	constructor(defaults = {}, authorities = {}) {
		this.defaults = defaults;
		this.authority = authorities.building || new BuildingAuthority();
	}

	/** Creates one structural building using a named style or raw canonical profile. */
	create(styleOrProfile = 'village', options = {}) {
		const identity = typeof styleOrProfile === 'string'
			? styleOrProfile
			: styleOrProfile?.id || styleOrProfile?.style || 'custom-building';
		const context = createNatureCallContext(
			this.defaults,
			options,
			'domem-building',
			identity
		);
		const profile = normalizedProfile(styleOrProfile, options, context.seed);
		const materials = createBuildingNatureMaterials(options.materials);
		const heightAt = options.heightAt || flatGround(options.groundY);
		const plan = this.authority.create(profile, materials, heightAt, options);
		return createNatureResult('building', context, plan, buildingDiagnostics(plan));
	}

	/** Returns one normalized structural profile without sampling terrain. */
	profile(styleOrProfile = 'village', overrides = {}) {
		const raw = typeof styleOrProfile === 'string'
			? createBuildingNatureProfile(styleOrProfile, overrides)
			: { ...(styleOrProfile || {}), ...overrides };
		return this.authority.profile(raw);
	}

	/** Lists stable one-call building presets. */
	styles() {
		return listBuildingNatureProfiles();
	}
}

/** Builds a profile while keeping generated identity and caller placement deterministic. */
function normalizedProfile(styleOrProfile, options, seed) {
	const overrides = {
		...options.profile,
		id: options.id || options.profile?.id || `building-${seed}`,
		x: options.x ?? options.profile?.x,
		yaw: options.yaw ?? options.profile?.yaw,
		z: options.z ?? options.profile?.z
	};
	return typeof styleOrProfile === 'string'
		? createBuildingNatureProfile(styleOrProfile, overrides)
		: { ...(styleOrProfile || {}), ...overrides };
}

/** Creates a zero-cost flat terrain sampler for simple scenes and tests. */
function flatGround(groundY = 0) {
	const elevation = Number.isFinite(Number(groundY)) ? Number(groundY) : 0;
	return () => elevation;
}

/** Extracts structural evidence without copying the complete immutable building plan. */
function buildingDiagnostics(plan) {
	return {
		definitionCount: plan.definitions.length,
		doorCount: plan.doors.length,
		floors: plan.profile.floors,
		groundSupportCount: plan.groundSupports.length,
		roomCount: plan.roomCount,
		style: plan.profile.style || 'custom'
	};
}
