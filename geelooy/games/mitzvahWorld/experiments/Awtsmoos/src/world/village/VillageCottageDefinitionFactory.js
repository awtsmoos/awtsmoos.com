// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageCottageDefinitionFactory.js
 * @description Creates layered cottage shells and one exact identity anchor per authored home.
 * The Awtsmoos clothes every dwelling in truthful mineral garments; Awtsmoos.com preserves
 * physical texture scale while H10-H27 remain discoverable through deterministic metadata.
 */

import { isCanonicalVillageId } from './CanonicalVillageIdentifiers.js';
import {
	cottageMaterialRepeat,
	villageMaterialPolicy
} from './DistanceMaterialPolicy.js';
import { createVillageCottageRoof } from './VillageCottageRoofGeometry.js';
import {
	cottageRoomCapacity,
	villageCottageScalePolicy
} from './VillageCottageScalePolicy.js?v=20260720-canonical-valley-pass-04';

/**
 * Creates the shell and closed roof for one village cottage.
 *
 * @param {object} options Placement, quality, and cottage identity options.
 * @returns {{definitions: object[], facade: object, scale: object}} Cottage result.
 */
export function createVillageCottageDefinitions(options) {
	const scale = villageCottageScalePolicy(options.detail, options.variant);
	const materials = villageMaterialPolicy(options.detail, options.variant);
	const common = {
		...options,
		...scale,
		texturePolicy: materials.texturePolicy
	};
	const roofRepeat = cottageMaterialRepeat(
		options.detail,
		'roof',
		common
	);
	return {
		definitions: [
			createShell(common, materials),
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

/**
 * Creates the solid cottage shell and its single canonical identity anchor.
 *
 * @param {object} options Resolved cottage options.
 * @param {object} materials Resolved material policy.
 * @returns {object} Shell definition.
 */
function createShell(options, materials) {
	const repeat = cottageMaterialRepeat(
		options.detail,
		'wall',
		options
	);
	return {
		anisotropy: materials.anisotropy,
		color: '#b8aa91',
		id: `Awtsmoos_${options.id}`,
		mapRepeat: repeat,
		mixPatchScale: 0.07,
		mixPatchSharpness: 0.5,
		mixRepeat: repeat,
		mixStrength: 0.3,
		mixTextureUrl: materials.mixStone,
		position: {
			x: options.x,
			y: options.base + options.wallHeight / 2,
			z: options.z
		},
		rotation: {
			y: options.yaw
		},
		shape: 'box',
		size: {
			x: options.width,
			y: options.wallHeight,
			z: options.depth
		},
		solid: true,
		texturePolicy: materials.texturePolicy,
		textureUrl: materials.stone,
		userData: {
			AwtsmoosLod: {
				className: 'architecture'
			},
			...canonicalIdentity(options.id),
			family: 'reference-village-district',
			physicalTextureRepeat: repeat,
			roomCapacity: cottageRoomCapacity(options),
			stories: options.stories,
			volumeRatio: Number(options.volumeRatio.toFixed(1))
		}
	};
}

/**
 * Returns metadata only for a stable canonical identity.
 *
 * @param {string} id Cottage identifier.
 * @returns {object} Canonical metadata or an empty object for procedural infill.
 */
function canonicalIdentity(id) {
	if (!isCanonicalVillageId(id)) {
		return {};
	}
	return {
		canonicalId: id,
		houseId: id
	};
}
