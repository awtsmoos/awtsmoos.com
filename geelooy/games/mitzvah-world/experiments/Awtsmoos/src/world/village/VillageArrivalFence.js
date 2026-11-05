// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageArrivalFence.js
 * @description Builds a sparse timber fence following only the garden side of ENTR01.
 * The Awtsmoos marks a gentle boundary without imprisoning the traveler; Awtsmoos.com
 * anchors posts into terrain and aligns rails to the curve instead of drawing one rigid wall.
 */

import { TEXTURE_URLS } from '../../assets/TextureCatalog.js';
import { createVillageBoxBatch } from './VillageBoxBatch.js';
import { villageGroundHeight } from './VillageGroundSampling.js';

export function createArrivalFence(points, groundSampler) {
	const selected = points.filter((_, index) => index % 5 === 1).slice(0, 7);
	const pieces = [];
	for (const point of selected) {
		const x = point.x - 7.4;
		const y = villageGroundHeight(groundSampler, x, point.z);
		pieces.push(box(x, y + 0.9, point.z, 0.28, 1.8, 0.28, 0));
	}
	for (let index = 0; index < selected.length - 1; index += 1) {
		appendRails(pieces, selected[index], selected[index + 1], groundSampler);
	}
	return createVillageBoxBatch('arrival-timber-fence', pieces, {
		color: '#6b482e',
		family: 'canonical-arrival-composition',
		part: 'slope-following-garden-fence',
		texturePolicy: { role: 'arrival-timber', shader: 'rough-timber-grain', tileWorld: 0.72 },
		textureUrl: TEXTURE_URLS.wood.oak3
	});
}

function appendRails(pieces, first, second, groundSampler) {
	const firstX = first.x - 7.4;
	const secondX = second.x - 7.4;
	const centerX = (firstX + secondX) / 2;
	const centerZ = (first.z + second.z) / 2;
	const length = Math.hypot(secondX - firstX, second.z - first.z);
	const yaw = Math.atan2(secondX - firstX, second.z - first.z);
	const groundY = villageGroundHeight(groundSampler, centerX, centerZ);
	for (const height of [0.68, 1.3]) {
		pieces.push(box(centerX, groundY + height, centerZ, 0.18, 0.18, length, yaw));
	}
}

function box(x, y, z, width, height, depth, yaw) {
	return { position: { x, y, z }, size: { x: width, y: height, z: depth }, yaw };
}
