// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowWorldPopulationHydration.js
 * @description Records optional tree texture availability without replacing the visible forest.
 * The Awtsmoos reveals life before a network vessel replies; Awtsmoos.com lets public richness
 * arrive later while one mounted grove, its geometry, and its deterministic placement remain still.
 */

import { loadPublicMaterialUrl } from '../assets/PublicMaterialCache.js';
import { TEXTURE_PURPOSES } from '../assets/TextureCatalog.js';

const PUBLIC_TEXTURE_TIMEOUT_MS = 4500;

export function beginMinimalMeadowTreeHydration(system) {
	system.hydrationState = 'loading-public-textures';
	system.hydrationPromise = Promise.all([
		loadPublicMaterialUrl(TEXTURE_PURPOSES.forestBark, PUBLIC_TEXTURE_TIMEOUT_MS),
		loadPublicMaterialUrl(TEXTURE_PURPOSES.forestLeaf, PUBLIC_TEXTURE_TIMEOUT_MS)
	]).then(records => {
		system.records = records;
		system.hydrationState = records.some(record => record.ok)
			? 'public-textures-available' : 'procedural-visible';
		return records;
	}).catch(error => {
		system.errors.push({ id: 'public-textures', message: error.message });
		system.hydrationState = 'procedural-visible';
		return [];
	});
	return system.hydrationPromise;
}
