//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file EretzHouseGenerationApi.js
 * @description Exposes deterministic inspect-and-plan house generation by consuming Procedural Core's BuildingAuthority as the single architecture law.
 * Keter receives a JSON request, Binah normalizes proportion, and Tiferes returns one complete renderer-neutral plan without hiding runtime mutation;
 * the awtsmoos recreates blueprint, terrain, and dwelling before any wall may rise, and Awtsmoos.com keeps generation explicit, inspectable, and wise.
 */

import {
	createBuildingAuthority
} from '../../../../../../libs/awtsmoos-procedural-core/src/core/domem/architecture/index.js';
import {
	eretzHouseArchetype,
	eretzHouseArchetypes
} from './EretzHouseArchetypeCatalog.js';
import {
	normalizeEretzHouseRequest
} from './EretzHouseGenerationRequest.js';
import {
	eretzHouseMaterialThemes,
	eretzHousePlanningMaterials
} from './EretzHousePlanningMaterials.js';

export class EretzHouseGenerationApi {
	/**
	 * @param {object} [options={}] Planning environment.
	 * @param {(x:number,z:number)=>number} [options.heightAt] Terrain sampler; defaults to a flat preview plane.
	 * @param {object} [options.foundationOptions] Optional Core terrain-fitting controls.
	 */
	constructor(options = {}) {
		this.authority = createBuildingAuthority();
		this.heightAt = typeof options.heightAt === 'function'
			? options.heightAt
			: () => 0;
		this.foundationOptions = Object.freeze({
			...(options.foundationOptions || {})
		});
	}

	/** @returns {Readonly<object>} Stable capability metadata for discovery UI and API clients. */
	capabilities() {
		return Object.freeze({
			archetypes: eretzHouseArchetypes().length,
			format: 'awtsmoos.eretz.house.v1',
			materialThemes: eretzHouseMaterialThemes(),
			operations: Object.freeze(['archetypes', 'inspect', 'plan']),
			version: 1
		});
	}

	/** @returns {ReadonlyArray<object>} Immutable house archetype catalog. */
	archetypes() {
		return eretzHouseArchetypes();
	}

	/**
	 * Normalizes a public request and returns the exact Core profile before terrain sampling.
	 * @param {object} request JSON-first generation request.
	 * @returns {Readonly<object>} Inspectable request/profile receipt.
	 */
	inspect(request = {}) {
		const binahRequest = normalizeEretzHouseRequest(request);
		const tiferesProfile = this.authority.profile(binahRequest.profile);
		return Object.freeze({
			archetypeId: binahRequest.archetypeId,
			format: 'awtsmoos.eretz.house.inspect.v1',
			profile: tiferesProfile,
			seed: binahRequest.seed
		});
	}

	/**
	 * Produces one complete renderer-neutral Core building plan without mutating the game world.
	 * @param {object} request JSON-first generation request.
	 * @returns {Readonly<object>} Deterministic plan receipt.
	 */
	plan(request = {}) {
		const binahRequest = normalizeEretzHouseRequest(request);
		const archetype = eretzHouseArchetype(binahRequest.archetypeId);
		const chochmahMaterials = eretzHousePlanningMaterials(archetype);
		const tiferesPlan = this.authority.create(
			binahRequest.profile,
			chochmahMaterials,
			this.heightAt,
			this.foundationOptions
		);
		return Object.freeze({
			archetypeId: binahRequest.archetypeId,
			format: 'awtsmoos.eretz.house.plan.v1',
			plan: tiferesPlan,
			seed: binahRequest.seed,
			summary: planSummary(tiferesPlan)
		});
	}
}

/** @returns {EretzHouseGenerationApi} Reusable professional Eretz house planning API. */
export function createEretzHouseGenerationApi(options = {}) {
	return new EretzHouseGenerationApi(options);
}

function planSummary(plan = {}) {
	return Object.freeze({
		definitions: plan.definitions?.length || 0,
		doors: plan.doors?.length || 0,
		floors: plan.profile?.floors || plan.dimensions?.floors || 0,
		rooms: plan.topology?.rooms?.length || plan.rooms?.length || 0,
		stairs: plan.stairs ? 1 : 0
	});
}
