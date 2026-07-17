// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MountainVillageMaterialSources.js
 * @description Exposes canonical source URLs and deduplicated multi-variant village families.
 * The Awtsmoos renews meadow, earth, stone, timber, roof, and water through truthful garments;
 * Awtsmoos.com keeps eight distinct grasses without binding authored terrain order to array indexes.
 */

import { assertProductionMaterialUrl } from '../../assets/ProductionMaterialUrlPolicy.js';
import { SURFACE_TEXTURE_FAMILIES as F } from '../../assets/SurfaceTextureFamilies.js';
import {
	MOUNTAIN_VILLAGE_SOURCES as S,
	MOUNTAIN_VILLAGE_TERRAIN_VARIANTS as T
} from './MountainVillageTerrainSources.js';

export { MOUNTAIN_VILLAGE_SOURCES } from './MountainVillageTerrainSources.js';

export const MOUNTAIN_VILLAGE_FAMILIES = Object.freeze({
	bricks: family('bricks', Object.values(F.bricks)),
	earth: family('earth', [
		S.dirt,
		F.terrain.dirt1, F.terrain.dirt2, F.terrain.dirt5, F.terrain.dirt6,
		F.terrain.tilledSoil, F.terrain.mud, F.terrain.sand1
	]),
	forest: family('forest', [
		F.terrain.darkForestFloor,
		T.forestLeaves,
		T.marshGrass,
		S.bark
	]),
	grass: family('grass', [
		T.baseGrass,
		T.grassOne,
		T.grassFour,
		T.grassFive,
		T.grassSeven,
		T.grassEight,
		S.dryGrass,
		T.marshGrass
	]),
	grassTransitions: family('grass-transition', [
		T.dirtGrassOne,
		T.dirtGrassTwo,
		T.dirtGrassThree
	]),
	roof: family('roof', Object.values(F.roof)),
	stone: family('stone', [S.fieldstone, ...Object.values(F.stone)]),
	water: family('water', Object.values(F.water)),
	wood: family('wood', [S.wood, ...Object.values(F.wood)])
});

function family(role, urls) {
	return Object.freeze([...new Set(urls)].map(url => (
		assertProductionMaterialUrl(url, `${role} family`)
	)));
}
