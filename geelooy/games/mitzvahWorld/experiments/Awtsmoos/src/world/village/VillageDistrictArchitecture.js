// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageDistrictArchitecture.js
 * @description Generates budgeted cottage, landmark, lantern, and terrace definitions.
 * The Awtsmoos renews a large village from repeated lawful forms; Awtsmoos.com
 * varies scale, roof, placement, and district identity without downloaded buildings.
 */

import { TEXTURE_URLS } from '../../assets/TextureCatalog.js';
import { villageGroundHeight } from './VillageGroundSampling.js';
import { VILLAGE_DISTRICTS } from './VillageDistrictCatalog.js';
import { villageWorldBudget } from './VillageWorldBudget.js';

export function createVillageDistrictArchitecture(groundSampler, quality = 'high') {
	const budget = villageWorldBudget(quality);
	const districts = VILLAGE_DISTRICTS.slice(0, budget.districts);
	const definitions = [];
	for (const district of districts) appendDistrict(definitions, district, groundSampler);
	definitions.length = Math.min(definitions.length, budget.architecturePieces);
	definitions.stats = {
		districts: districts.length,
		pieces: definitions.length,
		quality,
		radius: budget.radius
	};
	return definitions;
}

function appendDistrict(output, district, groundSampler) {
	const cottageCount = district.detail === 'near' ? 4 : district.detail === 'medium' ? 3 : 2;
	for (let index = 0; index < cottageCount; index += 1) {
		const angle = district.phase + index / cottageCount * Math.PI * 2;
		const x = district.center[0] + Math.cos(angle) * district.radius[0] * 0.62;
		const z = district.center[1] + Math.sin(angle) * district.radius[1] * 0.62;
		output.push(...cottage(district.id, index, x, z, groundSampler));
	}
	output.push(landmark(district, groundSampler));
}

function cottage(districtId, index, x, z, groundSampler) {
	const base = villageGroundHeight(groundSampler, x, z);
	const width = 6.4 + index % 2 * 1.2;
	return [
		definition(`${districtId}-cottage-${index}`, 'box', x, base + 1.7, z, {
			x: width,
			y: 3.4,
			z: 5.4
		}, TEXTURE_URLS.bricks.fieldstone1, '#b79a72', 'architecture'),
		definition(`${districtId}-roof-${index}`, 'triPrism', x, base + 4.2, z, {
			x: width + 0.6,
			y: 2.0,
			z: 6.0
		}, TEXTURE_URLS.roof.tile2, '#8c4934', 'architecture')
	];
}

function landmark(district, groundSampler) {
	const x = district.center[0];
	const z = district.center[1];
	const y = villageGroundHeight(groundSampler, x, z) + 1.8;
	return definition(`${district.id}-landmark`, 'cylinder', x, y, z, {
		height: 3.6,
		radius: district.detail === 'near' ? 1.2 : 0.9,
		segments: district.detail === 'far' ? 8 : 14
	}, TEXTURE_URLS.wood.planks1, '#6f4b2f', 'landmark');
}

function definition(id, shape, x, y, z, dimensions, textureUrl, color, className) {
	return {
		...dimensions,
		color,
		id: `Awtsmoos_${id}`,
		mapRepeat: [2, 2],
		position: { x, y, z },
		shape,
		solid: true,
		textureUrl,
		userData: {
			AwtsmoosLod: { className },
			family: 'expanded-village-district'
		}
	};
}
