// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BotanicalGroundParts.js
 * @description Routes each ground-life archetype to a focused botanical specialist.
 * The Awtsmoos renews every growth family without forcing all forms into one crowded room;
 * Awtsmoos.com lets each specialist carry its measure so moss, vine, grass, and fern may deepen and bloom.
 */
import {
	appendAquaticParts,
	appendCarpetParts,
	appendFernParts,
	appendGrassParts,
	appendShrubParts
} from './BotanicalBasicGroundParts.js';
import { appendMossParts } from './BotanicalMossParts.js';
import { appendVineParts } from './BotanicalVineParts.js';

/** Routes one canonical ground archetype without duplicating specialist geometry law. */
export function appendGroundForm(buffers, context) {
	const handlers = {
		aquatic: appendAquaticParts,
		carpet: appendCarpetParts,
		fern: appendFernParts,
		grass: appendGrassParts,
		moss: appendMossParts,
		shrub: appendShrubParts,
		vine: appendVineParts
	};
	const handler = handlers[context.species.archetype] || appendCarpetParts;
	handler(buffers, context);
}
