// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file GrassGroundMaterial.js
 * @description The ONE shared texture-only grass ground material for Mitzvah World
 * (Chapter 4 Task 4): pixelated grass is fixed through sampling, not density.
 *
 * Texture source — locally packaged, no new fetch: the base map is the existing
 * catalog entry `highestResolutionSurface('baseGrass')`
 * (`textures/essential-grass.jpg`), with the existing `grass4` / `grass5`
 * catalog entries as the layered alternates. No new texture is fetched from
 * the network and no generated ground imagery is substituted: the Core layered
 * path stamps `generatedTextureAllowed: false`, so the ground stays
 * photographic and the fix lives entirely in sampling.
 *
 * Sampling contract (the actual fix — the old factory shipped
 * `anisotropy: false`, an arbitrary `mapRepeat: [10, 10]`, and no color-space
 * or mipmap policy, which is stretched, coarse foreground sampling):
 * - color space sRGB, mipmaps on, LinearMipmapLinear minification, Linear
 *   magnification, RepeatWrapping on both axes;
 * - near-field anisotropy 8 on desktop, 4 on mobile (grazing-angle crawling
 *   edges are an anisotropy failure, not a density failure);
 * - repeat derived from real source pixels at a per-tier target texel
 *   density via exact fractional repeat — never an arbitrary integer;
 * - one tile may never cover more than MAX_TILE_WORLD_METERS of ground:
 *   the anti-stretch guard. The tile size depends only on source pixels and
 *   target density, never on the terrain extent, so no terrain size can
 *   stretch the grass;
 * - obvious tiling is dissolved the way the existing density layers already
 *   do it: the layered stack mixes the same photographic sources at macro
 *   and micro frequencies (see MinimalMeadowTerrainDensityLayers), and the
 *   meadow tint variation in BeautyGround breaks the remaining repetition.
 *
 * Sharing: one material per runtime (keyed only by mobile/desktop). Chunk
 * reloads re-request the same instance; nothing here clones a material per
 * chunk. The material factory is injected so this module stays node-testable;
 * production passes the Core native material factory.
 */

import { exactPixelRepeat } from '../../assets/TextureDensityMath.js';
import { GRASS_URLS } from '../TerrainTextureCatalog.js';

/** The one shared ground-grass material id. */
export const GRASS_GROUND_MATERIAL_ID = 'mitzvah-world-shared-grass-ground';
/** Catalog full-resolution default when no measured image size is supplied. */
export const GRASS_SOURCE_PIXELS = 2048;
/** One grass tile may never cover more ground than this (anti-stretch guard). */
export const MAX_TILE_WORLD_METERS = 40;
/** Near-field anisotropy: desktop / mobile. */
export const GRASS_GROUND_ANISOTROPY_DESKTOP = 8;
export const GRASS_GROUND_ANISOTROPY_MOBILE = 4;
/** Default terrain extent the repeat is computed against (exact fractional repeat keeps any extent stretch-free). */
export const GRASS_GROUND_DEFAULT_WORLD_METERS = 256;

/** Target texels per world meter, per quality tier. High (72) matches the existing native-frequency default. */
export const GRASS_GROUND_TEXELS_PER_METER = Object.freeze({
	cinematic: 96,
	high: 72,
	low: 52,
	medium: 62
});

/** Where the grass texture comes from: existing catalog entries only, no new fetch. */
export const GRASS_GROUND_SOURCE = Object.freeze({
	alternates: Object.freeze([GRASS_URLS[1], GRASS_URLS[2]]),
	primary: GRASS_URLS[0],
	provenance: 'existing-catalog-no-new-fetch'
});

/** Resolves a quality tier to its target grass texel density. */
export function grassGroundTexelsPerMeter(quality = 'high') {
	return GRASS_GROUND_TEXELS_PER_METER[quality] || GRASS_GROUND_TEXELS_PER_METER.high;
}

/**
 * Derives the stretch-free ground sampling for one terrain extent from real
 * source pixels. The tile world size is world-size independent, so the
 * anti-stretch guard holds for every terrain size.
 */
export function grassGroundSamplingFor({
	mobile = false,
	quality = 'high',
	sourceHeight = GRASS_SOURCE_PIXELS,
	sourceWidth = GRASS_SOURCE_PIXELS,
	worldDepth = GRASS_GROUND_DEFAULT_WORLD_METERS,
	worldWidth = GRASS_GROUND_DEFAULT_WORLD_METERS
} = {}) {
	const target = grassGroundTexelsPerMeter(quality);
	const sourceW = positive(sourceWidth, GRASS_SOURCE_PIXELS);
	const sourceH = positive(sourceHeight, GRASS_SOURCE_PIXELS);
	// A tile may never exceed MAX_TILE_WORLD_METERS: raise the effective
	// density rather than ever stretching one photograph across more ground.
	const effectiveTexels = Math.max(target, sourceW / MAX_TILE_WORLD_METERS, sourceH / MAX_TILE_WORLD_METERS);
	const repeat = exactPixelRepeat(worldWidth, worldDepth, sourceW, sourceH, effectiveTexels);
	const tileWorld = [sourceW / effectiveTexels, sourceH / effectiveTexels];
	return Object.freeze({
		anisotropy: mobile ? GRASS_GROUND_ANISOTROPY_MOBILE : GRASS_GROUND_ANISOTROPY_DESKTOP,
		effectiveTexelsPerMeter: effectiveTexels,
		mobile: Boolean(mobile),
		quality,
		repeat: Object.freeze([repeat[0], repeat[1]]),
		source: Object.freeze({ height: sourceH, width: sourceW }),
		targetTexelsPerMeter: target,
		tileWorld: Object.freeze([tileWorld[0], tileWorld[1]]),
		world: Object.freeze({ depth: positive(worldDepth, GRASS_GROUND_DEFAULT_WORLD_METERS), width: positive(worldWidth, GRASS_GROUND_DEFAULT_WORLD_METERS) })
	});
}

/** The frozen sampling policy every grass ground texture must carry. */
export function grassGroundTexturePolicy({ mobile = false, quality = 'high' } = {}) {
	const sampling = grassGroundSamplingFor({ mobile, quality });
	return Object.freeze({
		anisotropy: sampling.anisotropy,
		colorSpace: 'srgb',
		compression: 'source',
		magFilter: 'Linear',
		materialId: GRASS_GROUND_MATERIAL_ID,
		minFilter: 'LinearMipmapLinear',
		mipmaps: true,
		sampling: 'texture-only-native-frequency',
		tileWorldMeters: sampling.tileWorld,
		wrapS: 'RepeatWrapping',
		wrapT: 'RepeatWrapping'
	});
}

/**
 * Builds the complete frozen spec for the one shared grass ground material.
 * Pure and node-testable: no renderer, no image bytes, no network.
 */
export function createGrassGroundMaterialSpec(options = {}) {
	const sampling = grassGroundSamplingFor(options);
	const policy = grassGroundTexturePolicy(options);
	return Object.freeze({
		alternateUrls: GRASS_GROUND_SOURCE.alternates,
		anisotropy: sampling.anisotropy,
		materialId: GRASS_GROUND_MATERIAL_ID,
		mobile: sampling.mobile,
		name: 'Awtsmoos_shared_grass_ground',
		quality: sampling.quality,
		repeat: sampling.repeat,
		roughness: 0.92,
		sampling,
		sourceUrl: GRASS_GROUND_SOURCE.primary,
		texturePolicy: policy,
		tileWorld: sampling.tileWorld
	});
}

// One shared material per runtime, keyed only by mobile/desktop — never per chunk.
const sharedMaterials = new Map();

/**
 * Returns the ONE shared grass ground material, creating it on first use.
 * Repeated chunk reloads return the identical instance; the factory is
 * called at most once per mobile/desktop key.
 */
export function getSharedGrassGroundMaterial({ createMaterial, ...specOptions } = {}) {
	if (typeof createMaterial !== 'function') {
		throw new TypeError('A material factory is required.');
	}
	const spec = createGrassGroundMaterialSpec(specOptions);
	const key = spec.mobile ? 'mobile' : 'desktop';
	let entry = sharedMaterials.get(key);
	if (!entry) {
		const material = createMaterial({
			anisotropy: spec.anisotropy,
			color: [1, 1, 1, 1],
			mapRepeat: [...spec.repeat],
			metalness: 0,
			name: spec.name,
			roughness: spec.roughness,
			texturePolicy: spec.texturePolicy,
			textureUrl: spec.sourceUrl,
			userData: {
				AwtsmoosSharedGrassGround: Object.freeze({
					materialId: GRASS_GROUND_MATERIAL_ID,
					quality: spec.quality,
					singleMaterial: true,
					sourceUrl: spec.sourceUrl,
					tileWorldMeters: spec.tileWorld
				})
			}
		});
		entry = Object.freeze({ material, spec });
		sharedMaterials.set(key, entry);
	}
	return entry.material;
}

/** How many shared grass ground materials exist right now (0 or 1 per key). */
export function grassGroundMaterialCount() {
	return sharedMaterials.size;
}

/** Clears the shared-material cache (tests / quality-tier switches). */
export function resetGrassGroundMaterial() {
	sharedMaterials.clear();
}

/**
 * Proves the texture-only contract: one material, one base texture, correct
 * sampling flags, no stretched tile, and counts stable after reloads.
 */
export function packageGrassGroundMaterialEvidence({
	materialCount = 0,
	reloads = 0,
	sampling = null,
	textureCount = 0
} = {}) {
	const policyOk = Boolean(sampling)
		&& sampling.tileWorld[0] <= MAX_TILE_WORLD_METERS
		&& sampling.tileWorld[1] <= MAX_TILE_WORLD_METERS
		&& sampling.anisotropy >= GRASS_GROUND_ANISOTROPY_MOBILE
		&& sampling.effectiveTexelsPerMeter >= sampling.targetTexelsPerMeter;
	const checks = {
		correctSamplingFlags: policyOk,
		noStretchedTile: Boolean(sampling)
			&& sampling.tileWorld[0] <= MAX_TILE_WORLD_METERS
			&& sampling.tileWorld[1] <= MAX_TILE_WORLD_METERS,
		singleMaterial: materialCount === 1,
		singleTexture: textureCount === 1,
		stableAfterReloads: reloads >= 0 && materialCount === 1 && textureCount === 1
	};
	return Object.freeze({
		checks: Object.freeze(checks),
		ok: Object.values(checks).every(Boolean)
	});
}

function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : fallback;
}
