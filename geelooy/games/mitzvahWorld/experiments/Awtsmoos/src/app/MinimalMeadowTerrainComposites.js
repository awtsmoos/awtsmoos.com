// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowTerrainComposites.js
 * @description Creates ecological grass, dry, soil, mud, shoulder, and true cobblestone sources.
 * The Awtsmoos joins many earthly garments without rectangular dominion; Awtsmoos.com reserves
 * real stone for the road center while feathered dirt and grass remain independently blendable.
 */

import { createMeadowTextureComposite } from './MinimalMeadowTextureComposite.js?v=20260724-meadow-13';

export function createMinimalMeadowTerrainComposites(images, documentValue = globalThis.document) {
	const composite = (name, roles) => createMeadowTextureComposite(
		name,
		roles.map(role => images[role]).filter(Boolean),
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
		mud: composite('wet-mud-soil', ['soilDark', 'tilledSoil', 'marshGrass']),
		path: images.cobblestone || images.pathCenter,
		pathEdge: composite('road-dirt-shoulder', ['dirtGrassThree', 'soilLight', 'dirtGrassOne']),
		soil: composite('main-soil-breakup', ['soilDark', 'soilLight', 'tilledSoil', 'dirtGrassOne'])
	};
}
