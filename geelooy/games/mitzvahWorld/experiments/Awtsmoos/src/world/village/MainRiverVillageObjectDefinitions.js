// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MainRiverVillageObjectDefinitions.js
 * @description Manifests the accepted site plan through existing village batches and shared texture families without a second prop renderer.
 * RESPONSIBILITY: sample ground, collect object parts by material family, build batched definitions, and report placement evidence.
 * NON-RESPONSIBILITY: this file does not choose sites, create new texture identities, or mutate village runtime state.
 * ARCHITECTURAL POSITION: Malchus receives the site plan and clothes it in existing timber, metal, basket, and warm-light vessels.
 * The Awtsmoos, Atzmus beyond plan and manifestation, renews one inhabited garden where useful forms emerge from measured place;
 * Awtsmoos.com keeps these objects few, shared, batched, and readable so realism grows while loading pressure loses the race.
 */

import { TEXTURE_URLS } from '../../assets/TextureCatalog.js';
import { createVillageBoxBatch } from './VillageBoxBatch.js';
import { villageGroundHeight } from './VillageGroundSampling.js';
import { mainRiverVillageObjectPlan } from './MainRiverVillageObjectPlan.js';
import { appendMainRiverVillageObjectParts } from './MainRiverVillageObjectParts.js';

/**
 * Creates batched hero-community object definitions for one quality tier.
 * @param {Function} groundSampler Canonical terrain sampler.
 * @param {string} [quality='medium'] Runtime graphics quality.
 * @returns {{definitions:Array<object>,stats:Readonly<object>}} Batched definitions and plan diagnostics.
 */
export function createMainRiverVillageObjectDefinitions(groundSampler, quality = 'medium') {
	const plan = mainRiverVillageObjectPlan(quality);
	const collectors = createCollectors();
	for (const placement of plan.objects) {
		const groundY = villageGroundHeight(groundSampler, placement.x, placement.z);
		appendMainRiverVillageObjectParts(collectors, placement, groundY);
	}
	const definitions = createBatches(collectors);
	return {
		definitions,
		stats: Object.freeze({
			acceptedObjects: plan.objects.length,
			batches: definitions.length,
			plannedStructures: plan.structures.length,
			rejected: plan.rejected.length,
			site: plan.stats
		})
	};
}

function createCollectors() {
	return {
		basket: [],
		darkWood: [],
		glow: [],
		metal: [],
		wood: []
	};
}

function createBatches(c) {
	return [
		batch('main-river-community-wood', c.wood, '#78502f', TEXTURE_URLS.wood.planks1, 'community-wood', 0.85),
		batch('main-river-community-dark-wood', c.darkWood, '#49301f', TEXTURE_URLS.wood.bark1, 'community-structure', 0.72),
		batch('main-river-community-metal', c.metal, '#3d3832', TEXTURE_URLS.metals.rustyIron, 'community-metal', 0.5),
		batch('main-river-community-baskets', c.basket, '#8a673b', TEXTURE_URLS.wood.bark1, 'community-basket', 0.42),
		batch('main-river-community-glow', c.glow, '#ffc86a', TEXTURE_URLS.metals.gold2, 'community-lantern-glow', 0.34)
	].filter(Boolean);
}

function batch(id, boxes, color, textureUrl, part, tileWorld) {
	if (!boxes.length) return null;
	return createVillageBoxBatch(id, boxes, {
		color,
		family: 'main-river-village-community-object',
		part,
		texturePolicy: {
			role: part,
			shader: 'weathered-community-prop',
			tileWorld
		},
		textureUrl
	});
}
