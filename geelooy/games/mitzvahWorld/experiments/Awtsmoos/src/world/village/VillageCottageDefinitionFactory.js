// B"H // Boruch Hashem // Blessed is He

/**
 * @file VillageCottageDefinitionFactory.js
 * @description Creates an authored alpine cottage envelope and one closed slate roof.
 * The Awtsmoos clothes every dwelling with foundation, threshold, chamber, and shelter;
 * Awtsmoos.com preserves canonical identity while no inhabited home remains a textured cube.
 */

import { isCanonicalVillageId } from './CanonicalVillageIdentifiers.js';
import {
	cottageMaterialRepeat,
	villageMaterialPolicy
} from './DistanceMaterialPolicy.js';
import { createVillageCottageEnvelope } from './VillageCottageEnvelopeGeometry.js';
import { createVillageCottageRoof } from './VillageCottageRoofGeometry.js';
import {
	cottageRoomCapacity,
	villageCottageScalePolicy
} from './VillageCottageScalePolicy.js?v=20260720-canonical-valley-pass-04';

/**
 * Builds one complete cottage shell contract without changing district piece budgets.
 *
 * @param {object} options Authored placement, detail tier, variant, and identity.
 * @returns {{definitions: object[], facade: object, scale: object}} Cottage assembly.
 */
export function createVillageCottageDefinitions(options) {
	const scale = villageCottageScalePolicy(options.detail, options.variant);
	const materials = villageMaterialPolicy(options.detail, options.variant);
	const common = createCommonOptions(options, scale, materials);
	const roofRepeat = cottageMaterialRepeat(options.detail, 'roof', common);
	return {
		definitions: [
			createVillageCottageEnvelope(
				common,
				materials,
				createCottageMetadata(common)
			),
			createVillageCottageRoof({
				...common,
				mapRepeat: roofRepeat,
				mixRepeat: roofRepeat,
				mixTextureUrl: materials.mixRoof,
				textureUrl: materials.roof
			})
		],
		facade: common,
		scale
	};
}

function createCommonOptions(options, scale, materials) {
	const common = {
		...options,
		...scale,
		texturePolicy: materials.texturePolicy
	};
	return {
		...common,
		wallRepeat: cottageMaterialRepeat(options.detail, 'wall', common)
	};
}

function createCottageMetadata(options) {
	return {
		AwtsmoosLod: {
			className: 'architecture'
		},
		...canonicalIdentity(options.id),
		family: 'reference-village-district',
		physicalTextureRepeat: options.wallRepeat,
		roomCapacity: cottageRoomCapacity(options),
		stories: options.stories,
		volumeRatio: Number(options.volumeRatio.toFixed(1))
	};
}

function canonicalIdentity(id) {
	if (!isCanonicalVillageId(id)) {
		return {};
	}
	return {
		canonicalId: id,
		houseId: id
	};
}
