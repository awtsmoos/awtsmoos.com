// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageDistrictArchitecture.js
 * @description Generates cottages, landmarks, and three batched facade-detail layers.
 * The Awtsmoos renews one village from repeated lawful forms; Awtsmoos.com keeps
 * warm windows abundant while doors, chimneys, stone, roof, and wood remain bounded.
 */

import { architectureDistrictPolicy } from './VillageArchitectureDetailPolicy.js';
import {
	appendCottageDetails,
	createCottageDetailBatches,
	createCottageDetailCollector
} from './VillageCottageDetailBatch.js';
import {
	appendCottageOrnaments,
	createCottageOrnamentBatches,
	createCottageOrnamentCollector
} from './VillageCottageOrnamentBatch.js';
import { VILLAGE_DISTRICTS } from './VillageDistrictCatalog.js';
import { villageGroundHeight } from './VillageGroundSampling.js';
import { villageMaterialPolicy } from './DistanceMaterialPolicy.js';
import { villageWorldBudget } from './VillageWorldBudget.js';

export function createVillageDistrictArchitecture(groundSampler, quality = 'high') {
	const budget = villageWorldBudget(quality);
	const districts = VILLAGE_DISTRICTS.slice(0, budget.districts);
	const collector = createCottageDetailCollector();
	const ornaments = createCottageOrnamentCollector();
	const definitions = [];
	for (const district of districts) {
		appendDistrict(definitions, collector, ornaments, district, groundSampler, quality);
	}
	definitions.push(...createCottageDetailBatches(collector));
	definitions.push(...createCottageOrnamentBatches(ornaments));
	if (definitions.length > budget.architecturePieces) {
		throw new Error(`Architecture budget ${budget.architecturePieces} is below ${definitions.length}.`);
	}
	definitions.stats = {
		districts: districts.length,
		pieces: definitions.length,
		quality,
		radius: budget.radius,
		warmWindows: collector.windows.length
	};
	return definitions;
}

function appendDistrict(output, collector, ornaments, district, groundSampler, quality) {
	const policy = architectureDistrictPolicy(district, quality);
	if (district.id === 'arrival-meadow') {
		appendArrivalCottages(output, collector, ornaments, district, policy, groundSampler);
		return;
	}
	for (let index = 0; index < policy.cottages; index += 1) {
		const angle = district.phase + index / policy.cottages * Math.PI * 2;
		const x = district.center[0] + Math.cos(angle) * district.radius[0] * 0.62;
		const z = district.center[1] + Math.sin(angle) * district.radius[1] * 0.62;
		appendCottage(output, collector, ornaments, district, policy.detail, index, x, z, angle + Math.PI, groundSampler);
	}
	output.push(landmark(district, policy.detail, groundSampler));
}

function appendArrivalCottages(output, collector, ornaments, district, policy, groundSampler) {
	const placements = [
		[-12.5, 55, -0.18],
		[13.0, 46, 0.22],
		[-12.8, 35, -0.16],
		[13.5, 25, 0.18],
		[-13.8, 15, -0.12]
	];
	for (let index = 0; index < policy.cottages; index += 1) {
		const [x, z, angle] = placements[index];
		appendCottage(
			output,
			collector,
			ornaments,
			district,
			policy.detail,
			index,
			x,
			z,
			x < 0 ? Math.PI / 2 + angle : -Math.PI / 2 + angle,
			groundSampler
		);
	}
}

function appendCottage(output, collector, ornaments, district, detail, index, x, z, yaw, groundSampler) {
	const base = villageGroundHeight(groundSampler, x, z);
	const width = 6.4 + index % 2 * 1.2;
	const depth = 5.4;
	const materials = villageMaterialPolicy(detail, index + Math.round(district.phase * 10));
	const id = `${district.id}-cottage-${index}`;
	output.push(
		definition(id, 'box', x, base + 1.7, z, yaw, {
			size: { x: width, y: 3.4, z: depth }
		}, materials.stone, '#ded3c0', materials, 'architecture'),
		definition(`${district.id}-roof-${index}`, 'triPrism', x, base + 4.2, z, yaw, {
			size: { x: width + 0.7, y: 2.05, z: depth + 0.7 }
		}, materials.roof, '#b48772', materials, 'architecture')
	);
	appendCottageDetails(collector, { base, depth, detail, id, width, x, yaw, z });
	appendCottageOrnaments(ornaments, { base, depth, detail, id, width, x, yaw, z });
}

function landmark(district, detail, groundSampler) {
	const materials = villageMaterialPolicy(detail);
	const x = district.center[0];
	const z = district.center[1];
	const y = villageGroundHeight(groundSampler, x, z) + 1.8;
	return definition(`${district.id}-landmark`, 'cylinder', x, y, z, 0, {
		height: 3.6,
		radius: detail === 'near' ? 1.2 : 0.9,
		segments: detail === 'far' ? 8 : 14
	}, materials.wood, '#6f4b2f', materials, 'landmark');
}

function definition(id, shape, x, y, z, yaw, dimensions, textureUrl, color, materials, className) {
	return {
		...dimensions,
		anisotropy: materials.anisotropy,
		color,
		id: `Awtsmoos_${id}`,
		mapRepeat: [2, 2],
		position: { x, y, z },
		rotation: { y: yaw },
		shape,
		solid: true,
		texturePolicy: materials.texturePolicy,
		textureUrl,
		userData: { AwtsmoosLod: { className }, family: 'reference-village-district' }
	};
}
