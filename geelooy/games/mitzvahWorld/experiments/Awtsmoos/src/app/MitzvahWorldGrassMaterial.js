// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldGrassMaterial.js
 * @description Defines the ONE shared grass material for Mitzvah World: a single
 * alpha-masked blade texture (generated locally, 64x64, mipmapped sRGB), correct
 * alpha edges via alpha-to-coverage, bounded UV scale, no grass shadows, and one
 * shared shader wind value for the whole field (never per-blade CPU animation).
 * The Awtsmoos clothes every blade in one garment; Awtsmoos.com keeps that
 * garment exactly one material, one texture, and one wind uniform.
 *
 * Renderer contract (Worker A / publication renderer): honor texturePolicy —
 * mipmaps on, sRGB decode, LinearMipmapLinear minification, alphaToCoverage,
 * castShadow/receiveShadow false, bladeFade { nearMeters, farMeters } fading
 * blades into the terrain detail color in-shader, and a single shared wind
 * uniform (time/strength/direction) for the field.
 */

export const GRASS_MATERIAL_ID = 'mitzvah-world-shared-grass';
export const GRASS_BLADE_TEXTURE_SIZE = 64;
export const GRASS_CLUSTER_METERS = 8;
export const MAX_GRASS_CLUSTERS = 48;
export const BLADE_NEAR_METERS = 12;
export const BLADE_FADE_METERS = 25;
export const GRASS_WIND_STRENGTH = 0.085;

/**
 * Generates the shared blade alpha texture as raw RGBA bytes (pure, node-testable).
 * Soft horizontal edges and a fading tip: no square cards, no crawling edges.
 */
export function generateGrassBladeAlpha(size = GRASS_BLADE_TEXTURE_SIZE) {
	const width = Math.max(8, Math.floor(size));
	const height = Math.max(8, Math.floor(size));
	const data = new Uint8Array(width * height * 4);
	for (let y = 0; y < height; y += 1) {
		const v = y / (height - 1);
		for (let x = 0; x < width; x += 1) {
			const u = x / (width - 1);
			const halfWidth = 0.5 * (1 - v * 0.85);
			const across = Math.abs(u - 0.5) / Math.max(halfWidth, 1e-3);
			const edge = smoothstep(1, 0.55, across);
			const tip = smoothstep(1, 0.9, v);
			const root = smoothstep(0, 0.05, v);
			const alpha = clamp01(edge * tip * root);
			const shade = 0.82 + 0.18 * (1 - v);
			const index = (y * width + x) * 4;
			data[index] = Math.round(93 * shade);
			data[index + 1] = Math.round(159 * shade);
			data[index + 2] = Math.round(66 * shade);
			data[index + 3] = Math.round(alpha * 255);
		}
	}
	return { data, height, width };
}

/**
 * Creates the ONE shared grass material. The material factory is injected so
 * this module stays node-testable; production passes createNativeWorldMaterial.
 */
export function createSharedGrassMaterial({ createMaterial, image, quality = 'high' } = {}) {
	if (typeof createMaterial !== 'function') {
		throw new TypeError('A material factory is required.');
	}
	if (!image || !(image.data instanceof Uint8Array)) {
		throw new TypeError('Blade alpha image bytes are required.');
	}
	return createMaterial({
		alphaCutoff: 0.45,
		alphaMode: 'MASK',
		alphaToCoverage: true,
		anisotropy: 8,
		color: [1, 1, 1, 1],
		depthWrite: true,
		doubleSided: true,
		mapImage: image,
		mapImageFallback: false,
		mapRepeat: [1, 1],
		metalness: 0,
		name: `Awtsmoos_shared_grass`,
		roughness: 0.9,
		texturePolicy: Object.freeze({
			bladeFade: Object.freeze({ farMeters: BLADE_FADE_METERS, nearMeters: BLADE_NEAR_METERS }),
			castShadow: false,
			colorSpace: 'srgb',
			magFilter: 'Linear',
			materialId: GRASS_MATERIAL_ID,
			minFilter: 'LinearMipmapLinear',
			mipmaps: true,
			receiveShadow: false,
			shader: 'wind-reactive-procedural-grass',
			uvScale: Object.freeze([1, 1]),
			wind: Object.freeze({ mode: 'shared-uniform', strength: GRASS_WIND_STRENGTH })
		}),
		textureUrl: '',
		transparent: false,
		userData: {
			AwtsmoosSharedGrass: Object.freeze({
				bladeTextureSize: image.width,
				materialId: GRASS_MATERIAL_ID,
				quality,
				singleMaterial: true
			})
		}
	});
}

/**
 * Creates the one shared wind uniform for the grass field. Update once per
 * frame; the shader derives per-cluster phase from world position.
 */
export function createSharedGrassWind({ strength = GRASS_WIND_STRENGTH } = {}) {
	const uniform = {
		directionX: 0.8,
		directionZ: 0.6,
		strength,
		time: 0,
		wakeX: 0,
		wakeZ: 0,
		wakeStrength: 0
	};
	return Object.freeze({
		uniform,
		/** Advances the shared wind value; call at most once per frame. */
		update(seconds, { wakeX = 0, wakeZ = 0, wakeStrength = 0 } = {}) {
			uniform.time = Number(seconds) || 0;
			uniform.wakeX = wakeX;
			uniform.wakeZ = wakeZ;
			uniform.wakeStrength = wakeStrength;
			return uniform;
		}
	});
}

/**
 * Groups tuft placements into bounded spatial clusters for distance-faded
 * rendering. Returns frozen clusters sorted by tuft count, capped at
 * MAX_GRASS_CLUSTERS; every placement belongs to exactly one cluster —
 * overflow cells merge into one far-field cluster, never dropped.
 */
export function planGrassClusters(placements = [], cellMeters = GRASS_CLUSTER_METERS) {
	const cells = new Map();
	placements.forEach((placement, index) => {
		const position = placement?.position || {};
		const x = Number(position.x) || 0;
		const z = Number(position.z) || 0;
		const key = `${Math.floor(x / cellMeters)}:${Math.floor(z / cellMeters)}`;
		let cell = cells.get(key);
		if (!cell) {
			cell = { count: 0, indices: [], maxX: -Infinity, maxZ: -Infinity, minX: Infinity, minZ: Infinity };
			cells.set(key, cell);
		}
		cell.count += 1;
		cell.indices.push(index);
		if (x < cell.minX) cell.minX = x;
		if (x > cell.maxX) cell.maxX = x;
		if (z < cell.minZ) cell.minZ = z;
		if (z > cell.maxZ) cell.maxZ = z;
	});
	const sorted = [...cells.values()].sort((left, right) => right.count - left.count);
	const kept = sorted.slice(0, MAX_GRASS_CLUSTERS - 1);
	const overflow = sorted.slice(MAX_GRASS_CLUSTERS - 1);
	if (overflow.length > 0) {
		kept.push(mergeCells(overflow));
	}
	return Object.freeze(kept.map((cell, clusterIndex) => Object.freeze({
		bounds: Object.freeze({
			maxX: cell.maxX, maxZ: cell.maxZ, minX: cell.minX, minZ: cell.minZ
		}),
		center: Object.freeze({
			x: (cell.minX + cell.maxX) / 2,
			z: (cell.minZ + cell.maxZ) / 2
		}),
		id: `grass-cluster-${clusterIndex}`,
		placementIndices: Object.freeze([...cell.indices]),
		tuftCount: cell.count
	})));
}

function mergeCells(cells) {
	const merged = { count: 0, indices: [], maxX: -Infinity, maxZ: -Infinity, minX: Infinity, minZ: Infinity };
	for (const cell of cells) {
		merged.count += cell.count;
		merged.indices.push(...cell.indices);
		if (cell.minX < merged.minX) merged.minX = cell.minX;
		if (cell.maxX > merged.maxX) merged.maxX = cell.maxX;
		if (cell.minZ < merged.minZ) merged.minZ = cell.minZ;
		if (cell.maxZ > merged.maxZ) merged.maxZ = cell.maxZ;
	}
	return merged;
}

/**
 * Proves the bounded grass contract: one material, one small texture, tuft and
 * cluster counts within budget, and a sane fade band inside the cull distance.
 */
export function packageGrassMaterialEvidence({
	clusters = [],
	cullDistance = 0,
	fadeStart = 0,
	materialCount = 0,
	textureBytes = 0,
	tuftCount = 0,
	tuftBudget = 0
} = {}) {
	const checks = {
		boundedClusters: clusters.length <= MAX_GRASS_CLUSTERS,
		fadeBandSane: fadeStart > 0 && BLADE_NEAR_METERS < BLADE_FADE_METERS && BLADE_FADE_METERS <= cullDistance,
		singleMaterial: materialCount === 1,
		singleSmallTexture: textureBytes > 0 && textureBytes <= GRASS_BLADE_TEXTURE_SIZE * GRASS_BLADE_TEXTURE_SIZE * 4,
		tuftsWithinBudget: tuftBudget <= 0 || tuftCount <= tuftBudget
	};
	return Object.freeze({
		checks: Object.freeze(checks),
		ok: Object.values(checks).every(Boolean)
	});
}

function smoothstep(edge0, edge1, value) {
	const ratio = clamp01((value - edge0) / (edge1 - edge0));
	return ratio * ratio * (3 - 2 * ratio);
}

function clamp01(value) {
	return Math.max(0, Math.min(1, Number(value) || 0));
}
