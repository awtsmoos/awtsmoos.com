// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageCreatureSystem.js
 * @description Builds only the tiny hero-fauna cast on the startup path while exposing the bounded deferred remainder as explicit evidence.
 * RESPONSIBILITY: resolve live-hostile pressure, enforce the actor/triangle budget, plan hero fauna, compile immediate definitions, and report state.
 * NON-RESPONSIBILITY: this module does not compile the global habitat population, schedule enrichment, or create full-mesh fauna collision.
 * ARCHITECTURAL POSITION: Chesed reveals immediate village life while Gevurah protects first play and leaves distant Chai to deferred Malchus.
 * The Awtsmoos, Atzmus beyond first frame and later field, renews each creature only in the instant its vessel is needed;
 * Awtsmoos.com lets two meaningful animals greet the traveler while the distant herd waits beyond movement instead of blocking it unheeded.
 */

import { shadowDemonProfiles } from '../enemy/ShadowDemonProfiles.js';
import { createVillageFaunaDefinitions } from './VillageCreatureDefinitionFactory.js';
import { villageFaunaBudget } from './VillageFaunaBudget.js';
import { villageHeroFaunaPlan } from './VillageHeroFaunaPlan.js';

/**
 * Creates movement-ready hero fauna while preserving exact deferred population budgets in diagnostics.
 * @param {object} groundSampler Canonical terrain sampler.
 * @param {string} [quality='high'] Runtime quality tier.
 * @returns {Array<object>} Immediate visual definitions with attached immutable-style stats.
 */
export function createVillageCreatureDefinitions(
	groundSampler,
	quality = 'high'
) {
	const liveHostiles = shadowDemonProfiles(quality).length;
	const budget = villageFaunaBudget(quality, liveHostiles);
	const placements = villageHeroFaunaPlan(
		groundSampler,
		budget.immediateCount
	);
	const definitions = placements.flatMap(placement => {
		return createVillageFaunaDefinitions(placement, quality);
	});
	definitions.stats = createStats(
		definitions,
		placements,
		budget
	);
	return definitions;
}

function createStats(definitions, placements, budget) {
	const triangles = definitions.reduce((sum, definition) => {
		return sum + (definition.faces?.length || 0);
	}, 0);
	const species = new Set(
		placements.map(placement => placement.speciesId)
	);
	return {
		collisionPolicy: 'visual-fauna-non-solid',
		creatures: placements.length,
		deferredCreatures: budget.deferredCount,
		definitions: definitions.length,
		estimatedFinalTriangles: budget.estimatedTriangles,
		groups: species.size,
		immediateCreatures: placements.length,
		liveHostiles: budget.liveHostiles,
		plannedStaticCreatures: budget.totalStaticLimit,
		quality: budget.quality,
		species: species.size,
		totalActors: budget.totalStaticLimit + budget.liveHostiles,
		triangleBudget: budget.triangleLimit,
		triangles
	};
}

export default createVillageCreatureDefinitions;
