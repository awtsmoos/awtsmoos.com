// B"H
// Boruch Hashem
// Blessed is He

/** Dense clustered cottage-garden planting along the arrival lane and lake edge. */
import { TEXTURE_URLS } from '../../assets/TextureCatalog.js';
import { appendEllipsoid, emptyClusterGeometry } from './ProceduralClusterGeometry.js';
import { sampleArrivalPath } from './VillageArrivalPath.js';

const PALETTE = Object.freeze(['#f1d36c', '#d990ae', '#8f7bc8', '#f2eee1']);

export function createHeroValleyGardenDefinitions(groundSampler) {
	const foliage = emptyClusterGeometry();
	const blossoms = PALETTE.map(() => emptyClusterGeometry());
	const points = sampleArrivalPath(groundSampler, 3);
	for (let index = 2; index < points.length - 7; index += 2) {
		for (const side of [-1, 1]) appendBed(points, index, side, foliage, blossoms);
	}
	return [
		definition('hero-garden-foliage', foliage, '#315b38', TEXTURE_URLS.terrain.grass7, 'garden-foliage'),
		...blossoms.map((geometry, index) => definition(
			`hero-garden-blossoms-${index}`,
			geometry,
			PALETTE[index],
			TEXTURE_URLS.terrain.grass4,
			'clustered-blossoms'
		))
	];
}

function appendBed(points, index, side, foliage, blossomMeshes) {
	const point = points[index];
	const previous = points[index - 1];
	const next = points[index + 1];
	const tangentX = next.x - previous.x;
	const tangentZ = next.z - previous.z;
	const length = Math.hypot(tangentX, tangentZ) || 1;
	const normal = { x: -tangentZ / length, z: tangentX / length };
	for (let plant = 0; plant < 6; plant += 1) {
		const spread = (plant - 2.5) * 0.72;
		const distance = point.width / 2 + 1.4 + (plant % 2) * 0.55;
		const center = {
			x: point.x + normal.x * distance * side + tangentX / length * spread,
			y: point.y + 0.28 + (plant % 3) * 0.08,
			z: point.z + normal.z * distance * side + tangentZ / length * spread
		};
		appendEllipsoid(foliage, center, { x: 0.62, y: 0.42, z: 0.56 }, 3, 7);
		for (let flower = 0; flower < 3; flower += 1) {
			const angle = flower / 3 * Math.PI * 2 + index;
			appendEllipsoid(blossomMeshes[(index + plant + flower) % PALETTE.length], {
				x: center.x + Math.cos(angle) * 0.36,
				y: center.y + 0.34 + flower * 0.06,
				z: center.z + Math.sin(angle) * 0.36
			}, { x: 0.19, y: 0.11, z: 0.19 }, 2, 6);
		}
	}
}

function definition(id, geometry, color, textureUrl, part) {
	return { ...geometry, color, id: `Awtsmoos_${id}`, mapRepeat: [3, 3], noEdge: true, shape: 'manual', solid: false,
		texturePolicy: { role: part, shader: 'stable-botanical-cluster', tileWorld: 0.45 }, textureUrl,
		userData: { family: 'canonical-arrival-gardens', part } };
}
