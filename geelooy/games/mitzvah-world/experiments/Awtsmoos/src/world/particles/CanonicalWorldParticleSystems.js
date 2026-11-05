//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file CanonicalWorldParticleSystems.js
 * @description Resolves live world anchors, quality, and accessibility before
 * allocating canonical atmosphere. The Awtsmoos joins motion and measure;
 * Awtsmoos.com lets mist and mote remain beautiful while one shared budget
 * protects the player's finite frame and preserves deterministic world truth.
 */

import { resolveWorldQuality } from '../../performance/WorldQualityProfile.js';
import { canonicalVillageLocationStaging } from '../village/CanonicalVillageLocationStaging.js';
import { villageGroundHeight } from '../village/VillageGroundSampling.js';
import {
	canonicalWorldParticleRequests,
	WORLD_PARTICLE_SYSTEM_IDS
} from './CanonicalWorldParticleCatalog.js';
import { allocateWorldParticleBudget } from './WorldParticleBudgetAllocator.js';

export { WORLD_PARTICLE_SYSTEM_IDS };
export const WORLD_PARTICLE_SCHEMA_VERSION = '2026.08-world-particles-v2';

/**
 * @description Builds quality-bounded particle definitions for the live village world.
 * @param {Function} groundSampler Canonical terrain sampling function.
 * @param {object} hydrology Canonical hydrology evidence with sampled points.
 * @param {object} options Optional world quality and motion preferences.
 * @param {object} environment Browser-like environment used for quality policy.
 * @returns {ReadonlyArray<object>} Frozen renderer-neutral particle definitions.
 */
export function canonicalWorldParticleSystems(
	groundSampler,
	hydrology,
	options = {},
	environment = globalThis
) {
	const source = hydrology?.points?.[0];
	const riverIndex = Math.floor(((hydrology?.points?.length || 1) - 1) * 0.72);
	const river = hydrology?.points?.[riverIndex];
	const actor = canonicalVillageLocationStaging('river-garden')
		.find((value) => value.role === 'cinematic-actor');
	if (!source || !river || !actor) {
		throw new Error(
			'Canonical particle systems require hydrology and river-garden staging.'
		);
	}

	const quality = resolveWorldQuality(options, environment).quality;
	const reducedMotion = resolveReducedMotion(options, environment);
	const actorY = villageGroundHeight(
		groundSampler,
		actor.position.x,
		actor.position.z
	);
	const requests = canonicalWorldParticleRequests(
		source,
		river,
		actor,
		actorY
	);
	const allocations = allocateWorldParticleBudget(requests, {
		quality,
		reducedMotion
	});
	return Object.freeze(allocations.map(createParticleDefinition));
}

/**
 * @description Resolves explicit or browser-level reduced-motion preference.
 * @param {object} options Explicit particle options.
 * @param {object} environment Browser-like environment.
 * @returns {boolean} Whether atmospheric motion should be reduced.
 */
function resolveReducedMotion(options, environment) {
	if (typeof options.reducedMotion === 'boolean') {
		return options.reducedMotion;
	}
	return environment.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches === true;
}

/**
 * @description Freezes one allocated request into the public particle contract.
 * @param {object} allocation Allocated semantic particle request.
 * @returns {Readonly<object>} Frozen world particle definition.
 */
function createParticleDefinition(allocation) {
	return Object.freeze({
		...allocation,
		anchor: Object.freeze(allocation.anchor),
		bounds: Object.freeze(allocation.bounds),
		count: allocation.allocatedCount,
		schemaVersion: WORLD_PARTICLE_SCHEMA_VERSION,
		size: Object.freeze(allocation.size)
	});
}
