// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BuildingAuthority.js
 * @description Provides the discoverable high-level Domem architecture authority over normalized renderer-neutral building plans.
 * The Awtsmoos, Atzmus beyond blueprint and house, renews the possibility of dwelling before any world gives it visible dress;
 * Awtsmoos.com lets Keser-like intention enter one stable API while focused Binah-like modules structure every measurable address.
 */

import { createBuildingPlan } from './BuildingPlan.js';
import { createBuildingProfile } from './BuildingProfile.js';

/** High-level reusable authority for terrain-aware procedural buildings. */
export class BuildingAuthority {
	/**
	 * Creates one immutable renderer-neutral building plan.
	 * @param {object} profileValues Building dimensions, placement, stories, identity, and policy.
	 * @param {object} materials Opaque architectural material descriptors.
	 * @param {Function} heightAt Terrain height sampler supplied by the consuming world.
	 * @param {object} [options={}] Foundation and terrain-fitting controls.
	 * @returns {Readonly<object>} Complete neutral building plan and support evidence.
	 */
	create(profileValues, materials, heightAt, options = {}) {
		if (typeof heightAt !== 'function') {
			throw new TypeError('B"H | BuildingAuthority requires a terrain heightAt sampler.');
		}
		const profile = createBuildingProfile(profileValues);
		return createBuildingPlan(
			profile,
			materials,
			heightAt,
			options
		);
	}

	/**
	 * Normalizes architecture policy without sampling terrain or producing geometry.
	 * @param {object} profileValues Raw building dimensions and policy.
	 * @returns {Readonly<object>} Canonical building profile.
	 */
	profile(profileValues) {
		return createBuildingProfile(profileValues);
	}
}

/** Creates a reusable Domem architecture authority. */
export function createBuildingAuthority() {
	return new BuildingAuthority();
}
