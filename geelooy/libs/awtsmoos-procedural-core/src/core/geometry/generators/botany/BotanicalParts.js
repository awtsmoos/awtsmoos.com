// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BotanicalParts.js
 * @description Routes each species into flower or ground geometry without
 * teaching the runtime its secrets. One Awtsmoos, many botanical gestures.
 */
import { appendFlowerForm } from './BotanicalFlowerParts.js';
import { appendGroundForm } from './BotanicalGroundParts.js';

const GROUND_ARCHETYPES = new Set([
	'carpet',
	'fern',
	'grass',
	'vine',
	'shrub',
	'moss',
	'aquatic'
]);

/** Appends one complete plant to the supplied green, bloom, and accent buffers. */
export function appendBotanicalPlant(buffers, context) {
	if (GROUND_ARCHETYPES.has(context.species.archetype)) {
		appendGroundForm(buffers, context);
		return;
	}
	appendFlowerForm(buffers, context);
}
