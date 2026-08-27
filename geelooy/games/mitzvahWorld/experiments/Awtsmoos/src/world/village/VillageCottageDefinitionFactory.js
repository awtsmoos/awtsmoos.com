// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageCottageDefinitionFactory.js
 * @description Creates a textured envelope, inhabitable interior, and roof for one cottage.
 */

import { isCanonicalVillageId } from './CanonicalVillageIdentifiers.js';
import { cottageMaterialRepeat, villageMaterialPolicy } from './DistanceMaterialPolicy.js';
import { createVillageCottageEnvelope } from './VillageCottageEnvelopeGeometry.js';
import { cottageFoundationEnvelope } from './VillageCottageFoundationEnvelope.js';
import { createVillageCottageInterior } from './VillageCottageInteriorGeometry.js';
import { createVillageCottageRoof } from './VillageCottageRoofGeometry.js';
import {
	cottageRoomCapacity,
	villageCottageScalePolicy
} from './VillageCottageScalePolicy.js?v=20260721-expanded-interiors-01';

export function createVillageCottageDefinitions(options) {
	const fallbackScale = villageCottageScalePolicy(options.detail, options.variant);
	const materials = villageMaterialPolicy(options.detail, options.variant);
	const common = createCommonOptions(options, fallbackScale, materials);
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
		scale: structuralScale(common)
	};
}

function createCommonOptions(options, fallbackScale, materials) {
	const common = {
		...fallbackScale,
		...options,
		texturePolicy: materials.texturePolicy
	};
	return { ...common, wallRepeat: cottageMaterialRepeat(options.detail, 'wall', common) };
}

function createCottageMetadata(options) {
	return {
		AwtsmoosLod: { className: 'architecture' },
		...canonicalIdentity(options.id),
		archetype: options.archetype || 'three-story-house',
		expansionRatio: Number(options.expansionRatio.toFixed(2)),
		exterior: exteriorMetadata(options),
		family: 'reference-village-district',
		foundationEnvelope: cottageFoundationEnvelope(options),
		houseNumber: options.number || null,
		physicalTextureRepeat: options.wallRepeat,
		roomCapacity: options.roomCapacity,
		roomPurposes: [...(options.roomTypes || [])],
		stories: options.stories,
		volumeRatio: Number(options.volumeRatio.toFixed(1))
	};
}

function canonicalIdentity(id) {
	if (!isCanonicalVillageId(id)) return {};
	return { canonicalId: id, houseId: id };
}

function exteriorMetadata(options) {
	return {
		balcony: Boolean(options.balcony),
		chimney: options.chimney !== false,
		foundationStyle: options.foundationStyle || 'stone-plinth',
		gardenType: options.gardenType || 'flowers',
		porch: options.porch !== false,
		roofMaterial: options.roofMaterial || 'slate',
		windowPattern: options.windowPattern || 'paired'
	};
}

function structuralScale(options) {
	return Object.freeze({
		depth: options.depth,
		roofRise: options.roofRise,
		stories: options.stories,
		storyHeight: options.storyHeight,
		wallHeight: options.wallHeight,
		width: options.width
	});
}
