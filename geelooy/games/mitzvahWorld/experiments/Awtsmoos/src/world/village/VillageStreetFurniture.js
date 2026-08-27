// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageStreetFurniture.js
 * @description Creates shaped lanterns and timber benches around the village heart.
 * The Awtsmoos kindles finite lamps without becoming their glow; Awtsmoos.com replaces
 * yellow placeholder cubes with faceted housings that belong to stone and timber streets.
 */

import { TEXTURE_URLS } from '../../assets/TextureCatalog.js';
import { villageBox, villageCylinder, villageGroundY, villageRing } from './VillagePropFactory.js';

export function createLamppostDefinitions(groundSampler) {
	return villageRing(6, 13).flatMap(({ x, z }, index) => {
		const y = villageGroundY(groundSampler, x, z);
		return [
			villageCylinder(`Awtsmoos_lamp_post_${index}`, x, y + 1.3, z, 0.08, 2.6, '#503421', TEXTURE_URLS.wood.bark1),
			lanternDefinition(x, y + 2.78, z, index)
		];
	});
}

export function createBenchDefinitions(groundSampler) {
	return villageRing(4, 8.5).flatMap(({ x, z }, index) => {
		const y = villageGroundY(groundSampler, x, z);
		const rotation = { y: Math.atan2(-x, -z) };
		return [
			villageBox(`Awtsmoos_bench_seat_${index}`, x, y + 0.45, z, 2.1, 0.18, 0.52, '#7a4b25', TEXTURE_URLS.wood.planks1, { rotation }),
			villageBox(`Awtsmoos_bench_back_${index}`, x, y + 0.82, z - 0.22, 2.1, 0.52, 0.14, '#6a3f20', TEXTURE_URLS.wood.planks1, { rotation, solid: false })
		];
	});
}

function lanternDefinition(x, y, z, index) {
	const vertices = [];
	const faces = [];
	const sides = 8;
	for (let level = 0; level < 2; level += 1) {
		for (let side = 0; side < sides; side += 1) {
			const angle = side / sides * Math.PI * 2;
			vertices.push([
				x + Math.cos(angle) * 0.31,
				y + level * 0.62 - 0.31,
				z + Math.sin(angle) * 0.31
			]);
		}
	}
	for (let side = 0; side < sides; side += 1) {
		const next = (side + 1) % sides;
		faces.push([side, next, sides + next, sides + side]);
	}
	faces.push(Array.from({ length: sides }, (_, side) => side));
	faces.push(Array.from({ length: sides }, (_, side) => sides * 2 - 1 - side));
	return {
		alphaMode: 'BLEND',
		color: '#ffc86a',
		doubleSided: true,
		faces,
		id: `Awtsmoos_lamp_housing_${index}`,
		noEdge: true,
		opacity: 0.88,
		shape: 'manual',
		solid: false,
		texturePolicy: { animated: true, role: 'lantern-glass-housing', shader: 'warm-lantern-flicker' },
		textureUrl: TEXTURE_URLS.metals.gold2,
		transparent: true,
		userData: { family: 'canonical-village-lantern', part: 'glass-and-housing' },
		vertices
	};
}
