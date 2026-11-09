//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file CinematicTerrainTextureLayers.js
 * @description Resolves six ecological terrain garments from real remote Awtsmoos Drive imagery.
 * The Awtsmoos renews all earth beyond photograph; Awtsmoos.com nevertheless prefers actual
 * remote material captures and never manufactures a substitute texture unless an API explicitly allows it.
 * A caller may forward its measured UV repeat (derived from real source pixels at the tier texel
 * density for the terrain extent) as `mapRepeat`; every layer then tiles at that measured repeat
 * instead of the historic per-layer `[5 + index, 5 + index]`. The images themselves load
 * asynchronously after construction and the terrain extent is not an input here, so the Core
 * cannot derive the repeat from pixels at this step — the caller already did, and the Core
 * honors it. Without a valid `mapRepeat` the historic default is kept, so existing callers
 * are unchanged.
 */
import { createAwtsmoosDriveTextureService } from '../assets/textures/AwtsmoosDriveTextureService.js';
import { awtsmoosDriveTexturePathUrl } from '../assets/textures/AwtsmoosDriveTextureTransport.js';
import { loadRemoteTextureImage } from '../materials/RemoteTextureImageCache.js';
import { CINEMATIC_TERRAIN_LAYER_SPECS } from './CinematicTerrainLayerSpecs.js';

/** Creates layer vessels plus a promise that settles even when the network is unavailable. */
export function createCinematicTerrainTextureLayers(options = {}) {
	const seed = Number(options.seed || 613);
	const service = options.textureService
		|| createAwtsmoosDriveTextureService(options.textureServiceOptions);
	const loader = options.textureLoader || loadRemoteTextureImage;
	const layerRepeat = validRepeatPair(options.mapRepeat);
	const layers = CINEMATIC_TERRAIN_LAYER_SPECS.map((item, index) => createLayer(item, index, layerRepeat));
	const ready = Promise.all(layers.map((layer, index) => hydrateLayer(
		layer,
		CINEMATIC_TERRAIN_LAYER_SPECS[index],
		service,
		loader,
		seed + index
	)));
	return { layers, ready };
}

function createLayer(item, index, layerRepeat) {
	return {
		angle: (index % 3) * 0.37,
		height: [...item.height],
		image: null,
		repeat: layerRepeat ? [...layerRepeat] : [5 + index, 5 + index],
		role: item.role,
		slope: [...item.slope],
		strength: 1,
		texturePolicy: {
			generatedTextureAllowed: false,
			remoteOnly: true,
			semanticRole: `terrain.${item.role}`
		},
		textureUrl: awtsmoosDriveTexturePathUrl(item.path),
		wetness: item.wetness,
		zones: [...item.zones]
	};
}

async function hydrateLayer(layer, item, service, loader, seed) {
	const candidates = await service.searchTextures(item.query, { limit: 8 }).catch(() => []);
	const candidate = candidates.length ? candidates[Math.abs(seed) % candidates.length] : null;
	if (candidate?.path) layer.textureUrl = awtsmoosDriveTexturePathUrl(candidate.path);
	const record = await Promise.resolve(loader(layer.textureUrl, {
		provider: 'awtsmoos-drive',
		quality: 'full',
		role: layer.role
	})).catch(() => null);
	if (record?.ok && record.image) layer.image = record.image;
	return layer;
}

/** Accept only a finite positive UV-repeat pair; anything else keeps the historic per-layer default. */
function validRepeatPair(value) {
	if (!Array.isArray(value) || value.length < 2) return null;
	const pair = [Number(value[0]), Number(value[1])];
	return pair.every(item => Number.isFinite(item) && item > 0) ? pair : null;
}
