// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageMarketFurniture.js
 * @description Builds three inhabited stalls with tables, fabric awnings, and produce clusters.
 * The Awtsmoos clothes honest commerce in color and abundance; Awtsmoos.com replaces
 * anonymous gold cubes with stalls whose silhouette reads as MARKET01 at a glance.
 */

import { TEXTURE_URLS } from '../../assets/TextureCatalog.js';
import { villageBox, villageGroundY } from './VillagePropFactory.js';

const AWNING_COLORS = Object.freeze(['#8f3f32', '#be8b3d', '#556f61']);

export function createMarketFurniture(center, groundSampler) {
	return Array.from({ length: 3 }, (_, index) => createStall(center, groundSampler, index)).flat();
}

function createStall(center, groundSampler, index) {
	const x = center.x + (index - 1) * 4.4;
	const z = center.z + Math.abs(index - 1) * 0.8;
	const y = villageGroundY(groundSampler, x, z);
	return [
		villageBox(`Awtsmoos_MARKET01_table_${index}`, x, y + 0.65, z, 3.4, 0.35, 1.45, '#76502f', TEXTURE_URLS.wood.planks1),
		awningDefinition(x, y + 3.05, z, index),
		produceDefinition(x, y + 1.15, z, index)
	];
}

function awningDefinition(x, y, z, index) {
	const width = 3.8;
	const depth = 2.5;
	return {
		color: AWNING_COLORS[index],
		doubleSided: true,
		faces: [[0, 1, 2, 3], [4, 7, 6, 5]],
		id: `Awtsmoos_MARKET01_awning_${index}`,
		noEdge: true,
		shape: 'manual',
		solid: false,
		texturePolicy: { role: 'market-fabric-awning', shader: 'fabric-wind' },
		textureUrl: TEXTURE_URLS.wood.planks1,
		userData: { family: 'canonical-market', landmarkId: 'MARKET01', part: 'awning' },
		vertices: [
			[x - width / 2, y, z - depth / 2],
			[x + width / 2, y, z - depth / 2],
			[x + width / 2, y - 0.55, z + depth / 2],
			[x - width / 2, y - 0.55, z + depth / 2],
			[x - width / 2, y - 0.08, z - depth / 2],
			[x + width / 2, y - 0.08, z - depth / 2],
			[x + width / 2, y - 0.63, z + depth / 2],
			[x - width / 2, y - 0.63, z + depth / 2]
		]
	};
}

function produceDefinition(x, y, z, index) {
	const vertices = [];
	const faces = [];
	for (let item = 0; item < 7; item += 1) {
		appendProduce(
			vertices,
			faces,
			x + (item % 4 - 1.5) * 0.48,
			y + Math.floor(item / 4) * 0.28,
			z + (item % 2 - 0.5) * 0.42
		);
	}
	return {
		color: index === 0 ? '#b94332' : index === 1 ? '#d49a2f' : '#789744',
		faces,
		id: `Awtsmoos_MARKET01_produce_${index}`,
		noEdge: true,
		shape: 'manual',
		solid: false,
		userData: { family: 'canonical-market', landmarkId: 'MARKET01', part: 'produce' },
		vertices
	};
}

function appendProduce(vertices, faces, x, y, z) {
	const start = vertices.length;
	const radius = 0.22;
	vertices.push(
		[x, y + radius, z],
		[x + radius, y, z],
		[x, y, z + radius],
		[x - radius, y, z],
		[x, y, z - radius],
		[x, y - radius, z]
	);
	for (const face of [[0, 2, 1], [0, 3, 2], [0, 4, 3], [0, 1, 4], [5, 1, 2], [5, 2, 3], [5, 3, 4], [5, 4, 1]]) {
		faces.push(face.map((value) => start + value));
	}
}
