// B"H
// Boruch Hashem
// Blessed is He

/** Builds the first-view stone lane, fieldstone border, flowing rill, and timber fence in four draws. */
import { TEXTURE_URLS } from '../../assets/TextureCatalog.js';
import { createVillageBoxBatch } from './VillageBoxBatch.js';
import { villageGroundHeight } from './VillageGroundSampling.js';

export function createVillageArrivalComposition(groundSampler) {
	const stoneBorders = [];
	const timber = [];
	for (let index = 0; index < 23; index += 1) {
		const z = 88 - index * 1.72;
		const x = pathCenter(index);
		for (const side of [-1, 1]) {
			const borderX = x + side * 3.35;
			stoneBorders.push(box(
				borderX,
				ground(groundSampler, borderX, z) + 0.22,
				z,
				0.82 + index % 3 * 0.12,
				0.44 + index % 2 * 0.08,
				1.18,
				side * 0.08 + index * 0.03
			));
		}
	}
	appendRillStones(stoneBorders, groundSampler);
	appendArrivalFence(timber, groundSampler);
	const definitions = [
		arrivalPath(groundSampler),
		batch('arrival-fieldstone-border', stoneBorders, '#c1b29a', TEXTURE_URLS.bricks.fieldstone1, 'fieldstone-border', {
			role: 'arrival-fieldstone', shader: 'rough-stone-detail', tileWorld: 0.82
		}),
		batch('arrival-timber-fence', timber, '#795137', TEXTURE_URLS.wood.oak3, 'timber-fence', {
			role: 'arrival-timber', shader: 'rough-timber-grain', tileWorld: 0.7
		}),
		arrivalWaterRill(groundSampler)
	];
	definitions.stats = {
		drawDefinitions: definitions.length,
		featuredBotanicals: 24,
		pathSections: 24,
		stoneBorderPieces: stoneBorders.length,
		timberPieces: timber.length,
		waterSections: 11
	};
	return definitions;
}

function appendRillStones(output, groundSampler) {
	for (let index = 0; index < 11; index += 1) {
		const z = 87 - index * 3.7;
		const center = -7.15 + Math.sin(index * 0.72) * 0.44;
		for (const side of [-1, 1]) {
			const x = center + side * (0.92 + index % 2 * 0.08);
			output.push(box(
				x,
				ground(groundSampler, x, z) + 0.19,
				z,
				0.62 + index % 3 * 0.11,
				0.34 + index % 2 * 0.08,
				1.02,
				side * 0.16 + index * 0.07
			));
		}
	}
}

function arrivalPath(groundSampler) {
	const points = Array.from({ length: 24 }, (_, index) => {
		const z = 89 - index * 1.8;
		const x = pathCenter(index);
		return { x, y: ground(groundSampler, x, z) + 0.055, z, width: 5.45 + Math.sin(index * 0.5) * 0.18 };
	});
	return ribbon('arrival-cobblestone-lane', points, {
		color: '#d8cab2',
		family: 'reference-arrival-composition',
		part: 'cobbled-lane',
		texturePolicy: { fullResolutionSource: true, role: 'arrival-cobblestone', shader: 'rough-stone-detail', tileWorld: 0.72 },
		mapRepeat: [3.2, 13.5],
		textureUrl: TEXTURE_URLS.stone.floor2
	});
}

function arrivalWaterRill(groundSampler) {
	const points = Array.from({ length: 11 }, (_, index) => {
		const z = 87 - index * 3.7;
		const x = -7.15 + Math.sin(index * 0.72) * 0.44;
		return { x, y: ground(groundSampler, x, z) + 0.09, z, width: 1.42 + Math.sin(index * 0.9) * 0.12 };
	});
	return ribbon('arrival-flowing-water-rill', points, {
		alphaMode: 'BLEND',
		color: '#5db2c6',
		family: 'reference-arrival-composition',
		opacity: 0.84,
		part: 'flowing-water-rill',
		mapRepeat: [1.4, 8.5],
		texturePolicy: { fullResolutionSource: true, role: 'arrival-water', shader: 'flowing-water-fresnel', tileWorld: 0.86 },
		textureUrl: TEXTURE_URLS.water.shallowRiver,
		transparent: true
	});
}

function ribbon(id, points, options) {
	const vertices = [];
	const faces = [];
	for (let index = 0; index < points.length; index += 1) {
		const point = points[index];
		const previous = points[Math.max(0, index - 1)];
		const next = points[Math.min(points.length - 1, index + 1)];
		const dx = next.x - previous.x;
		const dz = next.z - previous.z;
		const length = Math.hypot(dx, dz) || 1;
		const sideX = -dz / length * point.width / 2;
		const sideZ = dx / length * point.width / 2;
		vertices.push([point.x + sideX, point.y, point.z + sideZ]);
		vertices.push([point.x - sideX, point.y, point.z - sideZ]);
		if (index > 0) {
			const start = index * 2;
			// The lane advances toward -Z. Keep the winding counter-clockwise from
			// above so lighting receives an upward normal instead of a black underside.
			faces.push([start - 2, start, start + 1, start - 1]);
		}
	}
	return {
		alphaMode: options.alphaMode || 'OPAQUE',
		color: options.color,
		doubleSided: true,
		faces,
		id: `Awtsmoos_${id}`,
		mapRepeat: options.mapRepeat || [1, 1],
		noEdge: true,
		opacity: options.opacity ?? 1,
		position: { x: 0, y: 0, z: 0 },
		shape: 'manual',
		solid: false,
		texturePolicy: { publicFirebase: true, ...options.texturePolicy },
		textureUrl: options.textureUrl,
		transparent: Boolean(options.transparent),
		userData: { family: options.family, part: options.part },
		vertices
	};
}

function appendArrivalFence(output, groundSampler) {
	for (const side of [-1, 1]) {
		const x = side * 9.2;
		for (let index = 0; index < 8; index += 1) {
			const z = 86 - index * 5.2;
			output.push(box(x, ground(groundSampler, x, z) + 0.92, z, 0.24, 1.84, 0.24, 0.04 * side));
		}
		for (const height of [0.65, 1.28]) {
			const z = 67.8;
			output.push(box(x, ground(groundSampler, x, z) + height, z, 0.18, 0.18, 36.4));
		}
	}
}

function batch(id, boxes, color, textureUrl, part, texturePolicy) {
	return createVillageBoxBatch(id, boxes, {
		color,
		family: 'reference-arrival-composition',
		part,
		texturePolicy: { fullResolutionSource: true, ...texturePolicy },
		textureUrl
	});
}

function box(x, y, z, width, height, depth, yaw = 0) {
	return { position: { x, y, z }, size: { x: width, y: height, z: depth }, yaw };
}

function pathCenter(index) {
	return Math.sin(index * 0.38) * 0.34;
}

function ground(groundSampler, x, z) {
	return villageGroundHeight(groundSampler, x, z);
}

export default createVillageArrivalComposition;
