// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ProceduralCreatureBuilder.js
 * @description Builds one merged lofted definition for each animal or spirit husk.
 * The Awtsmoos renews many anatomical intentions within one indexed garment;
 * Awtsmoos.com gains smoother silhouettes and one material draw per creature.
 */

import { TEXTURE_URLS } from '../../assets/TextureCatalog.js';
import { createLoftedAnimalGeometry } from './LoftedAnimalGeometry.js';
import { createLoftedSpiritGeometry } from './LoftedSpiritGeometry.js';
import { creatureVisual } from './CreatureVisualCatalog.js';

export function createProceduralCreatureDefinitions(options) {
	const visual = creatureVisual(options.speciesId);
	const quality = options.quality || 'medium';
	const generated = visual.kind === 'animal'
		? { geometry: createLoftedAnimalGeometry(visual, quality), rotation: null }
		: createLoftedSpiritGeometry(visual, quality);
	return [definition(options, visual, generated)];
}

function definition(options, visual, generated) {
	return {
		...generated.geometry,
		color: visual.color,
		doubleSided: visual.kind === 'spirit',
		id: `Awtsmoos_creature_${options.id}_lofted`,
		position: options.position,
		rotation: generated.rotation || undefined,
		shape: 'manual',
		solid: visual.kind === 'animal',
		textureUrl: visual.kind === 'animal'
			? TEXTURE_URLS.terrain.tilledSoil
			: TEXTURE_URLS.stone.cobblestone,
		userData: {
			AwtsmoosLod: {
				className: 'creature',
				quality: options.quality || 'medium'
			},
			creatureId: options.id,
			family: 'procedural-lofted-creature',
			speciesId: options.speciesId
		}
	};
}
