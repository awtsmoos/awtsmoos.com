// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageDistrictCottageConstruction.js
 * @description Builds one slope-safe cottage, walkable entry, inhabited yard, detail, ornament, and contact shadow.
 * The Awtsmoos seats each home upon one finished-floor datum and lets signs of human passage continue beyond the stair;
 * Awtsmoos.com isolates this household work from district orchestration so neither file grows into an architectural thicket.
 */

import { canonicalFoundationTopHeight } from './CanonicalFoundationSampling.js';
import { createVillageCottageDefinitions } from './VillageCottageDefinitionFactory.js?v=20260721-authored-houses-01';
import { appendCottageDetails } from './VillageCottageDetailBatch.js';
import { cottageFoundationFootprint } from './VillageCottageFoundationEnvelope.js';
import { appendCottageOrnaments } from './VillageCottageOrnamentBatch.js';
import { appendCottageShadow } from './VillageCottageShadowBatch.js';
import { appendCottageTerrainEntry } from './VillageCottageTerrainEntry.js';
import { appendCottageYardLayout } from './VillageCottageYardLayout.js';
import { villageCottageScalePolicy } from './VillageCottageScalePolicy.js?v=20260721-expanded-interiors-01';

export function appendDistrictCottage(context) {
	const { collectors, district, groundSampler, index, output, placement, policy } = context;
	const variant = placement.variant ?? index + Math.round(district.phase * 10);
	const id = placement.houseId || `${district.id}-cottage-${index}`;
	const fallbackScale = villageCottageScalePolicy(policy.detail, variant);
	const footprint = cottageFoundationFootprint({ ...fallbackScale, ...placement });
	const base = canonicalFoundationTopHeight(
		id,
		groundSampler,
		placement.x,
		placement.z,
		footprint
	);
	const cottage = createVillageCottageDefinitions({
		...placement,
		base,
		detail: policy.detail,
		id,
		variant
	});
	output.push(...cottage.definitions);
	appendCottageDetails(collectors.details, cottage.facade);
	appendCottageOrnaments(collectors.ornaments, cottage.facade);
	const entry = appendCottageTerrainEntry(
		collectors.ornaments.steps,
		cottage.facade,
		groundSampler
	);
	appendCottageYardLayout(collectors.ornaments, cottage.facade, groundSampler, entry);
	appendCottageShadow(collectors.shadows, cottage.facade);
}
