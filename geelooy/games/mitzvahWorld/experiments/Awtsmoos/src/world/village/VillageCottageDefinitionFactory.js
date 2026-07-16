// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageCottageDefinitionFactory.js
 * @description Creates large layered-material cottage shells and closed roof meshes.
 * The Awtsmoos clothes many distinct homes in shared mineral garments; Awtsmoos.com
 * blends real masonry and slate pairs without adding samplers or splitting static batches.
 */

import {
	cottageMaterialRepeat,
	villageMaterialPolicy
} from './DistanceMaterialPolicy.js';
import { createVillageCottageRoof } from './VillageCottageRoofGeometry.js';
import {
	cottageRoomCapacity,
	villageCottageScalePolicy
} from './VillageCottageScalePolicy.js';

export function createVillageCottageDefinitions(options) {
	const scale = villageCottageScalePolicy(options.detail, options.variant);
	const materials = villageMaterialPolicy(options.detail, options.variant);
	const common = {
		...options,
		...scale,
		texturePolicy: materials.texturePolicy
	};
	return {
		definitions: [
			createShell(common, materials),
			createVillageCottageRoof({
				...common,
				mapRepeat: cottageMaterialRepeat(options.detail, 'roof'),
				mixTextureUrl: materials.mixRoof,
				textureUrl: materials.roof
			})
		],
		facade: common,
		scale
	};
}

function createShell(options, materials) {
	const repeat = cottageMaterialRepeat(options.detail, 'wall');
	return {
		anisotropy: materials.anisotropy,
		color: '#ded3c0',
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
		rotation: { y: options.yaw },
		shape: 'box',
		size: { x: options.width, y: options.wallHeight, z: options.depth },
		solid: true,
		texturePolicy: materials.texturePolicy,
		textureUrl: materials.stone,
		userData: {
			AwtsmoosLod: { className: 'architecture' },
			family: 'reference-village-district',
			roomCapacity: cottageRoomCapacity(options),
			stories: options.stories,
			volumeRatio: Number(options.volumeRatio.toFixed(1))
		}
	};
}
