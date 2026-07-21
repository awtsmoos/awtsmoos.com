// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageCottageDefinitionFactory.js
 * @description Creates one expanded textured shell, roof, and traversable multi-room interior.
 * The Awtsmoos clothes every dwelling with foundation, threshold, chamber, and shelter;
 * Awtsmoos.com preserves identity while every house becomes a genuinely inhabitable vessel.
 */

import { isCanonicalVillageId } from './CanonicalVillageIdentifiers.js';
import {
	cottageMaterialRepeat,
	villageMaterialPolicy
} from './DistanceMaterialPolicy.js';
import { createVillageCottageEnvelope } from './VillageCottageEnvelopeGeometry.js';
import { cottageFoundationEnvelope } from './VillageCottageFoundationEnvelope.js';
import { createVillageCottageInterior } from './VillageCottageInteriorGeometry.js';
import { createVillageCottageRoof } from './VillageCottageRoofGeometry.js';
import {
	cottageRoomCapacity,
	villageCottageScalePolicy
} from './VillageCottageScalePolicy.js?v=20260721-expanded-interiors-01';

export function createVillageCottageDefinitions(options) {
	const scale = villageCottageScalePolicy(options.detail, options.variant);
	const materials = villageMaterialPolicy(options.detail, options.variant);
	const common = createCommonOptions(options, scale, materials);
	const roofRepeat = cottageMaterialRepeat(options.detail, 'roof', common);
	common.roomCapacity = cottageRoomCapacity(common);
	return {
		definitions: [
			createVillageCottageEnvelope(common, materials, createCottageMetadata(common)),
			createVillageCottageInterior(common, materials),
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
		AwtsmoosLod: { className: 'architecture' },
		...canonicalIdentity(options.id),
		expansionRatio: Number(options.expansionRatio.toFixed(2)),
		family: 'reference-village-district',
		foundationEnvelope: cottageFoundationEnvelope(options),
		physicalTextureRepeat: options.wallRepeat,
		roomCapacity: options.roomCapacity,
		stories: options.stories,
		volumeRatio: Number(options.volumeRatio.toFixed(1))
	};
}

function canonicalIdentity(id) {
	if (!isCanonicalVillageId(id)) return {};
	return { canonicalId: id, houseId: id };
}
