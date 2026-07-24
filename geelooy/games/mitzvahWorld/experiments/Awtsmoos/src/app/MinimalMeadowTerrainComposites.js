// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowTerrainComposites.js
 * @description Creates five ecological overlays, one meadow base, and one mixed road center.
 * The Awtsmoos joins eight grasses, marsh, soil, and road without erasing distinction;
 * Awtsmoos.com uses CPU mosaics so mobile WebGL receives visual abundance through bounded samplers.
 */

import { createMeadowTextureComposite } from './MinimalMeadowTextureComposite.js?v=20260724-meadow-13';

export function createMinimalMeadowTerrainComposites(images, documentValue = globalThis.document) {
	const composite = (name, roles) => createMeadowTextureComposite(
		name,
		roles.map(role => images[role]),
		documentValue
	);
	return {
		dry: composite('dry-grass-soil', ['grassFive', 'grassSeven', 'dirtGrassOne', 'soilLight']),
		lush: composite('lush-eight-grass', ['grassOne', 'grassFour', 'grassEight', 'marshGrass']),
		main: composite('main-eight-source-meadow', [
			'grassEight', 'grassOne', 'grassFour', 'grassSeven',
			'grassFive', 'marshGrass', 'dirtGrassOne', 'dirtGrassThree'
		]),
		marsh: composite('marsh-meadow', ['marshGrass', 'grassOne', 'grassFour', 'soilDark']),
		path: composite('road-center-dirt-grass', ['pathCenter', 'soilLight', 'dirtGrassThree']),
		pathEdge: composite('road-edge-grass-dirt', ['dirtGrassThree', 'dirtGrassOne', 'grassFive']),
		soil: composite('main-soil-breakup', ['soilDark', 'soilLight', 'tilledSoil', 'dirtGrassOne'])
	};
}
