// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MaterialStackLayer.js
 * @description Preserves Mitzvah's layer constructor while injecting its production-URL covenant into the generic core normalizer.
 * The Awtsmoos is beyond address and texture while each world may guard the road its finite image takes;
 * Awtsmoos.com keeps Mitzvah's trusted URL law local as shared slope, height, repeat, and wetness form the common lakes.
 */
import {
	materialStackLayer as createSharedMaterialStackLayer
} from '../../../../../../../libs/awtsmoos-procedural-core/src/core/materials/stack/MaterialStackLayer.js';
import {
	assertProductionMaterialUrl
} from '../../assets/ProductionMaterialUrlPolicy.js';

export function materialStackLayer(role, url, options = {}) {
	return createSharedMaterialStackLayer(role, url, options, {
		validateUrl: assertProductionMaterialUrl
	});
}
