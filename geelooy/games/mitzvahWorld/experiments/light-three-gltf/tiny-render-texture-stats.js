// B"H
import {
	sourceHeight,
	sourceWidth
} from './tiny-texture-source.js';

export function addMapStats(material, stats) {
	stats.texturedMeshes = (stats.texturedMeshes || 0) + 1;
	stats.textureUrl = material?.textureUrl
		|| material.mapImage.src
		|| material.mapImage.dataset?.url
		|| 'generated-canvas';
	stats.textureSize = `${sourceWidth(material.mapImage)}x${sourceHeight(material.mapImage)}`;
	stats.textureRepeat = material?.mapRepeat || [1, 1];
	stats.textureAnisotropy = material?.anisotropy ?? true;
	stats.texturePolicy = material?.texturePolicy || null;
}

export function addMixStats(material, stats) {
	const mapRepeat = material?.mapRepeat || [1, 1];
	const mixRepeat = material?.mixRepeat || [1, 1];
	stats.mixedTerrain = true;
	stats.mixTextureUrl = material?.mixTextureUrl
		|| material.mixImage.src
		|| material.mixImage.dataset?.url
		|| 'generated-canvas';
	stats.mixTextureSize = `${sourceWidth(material.mixImage)}x${sourceHeight(material.mixImage)}`;
	stats.mixRepeat = mixRepeat;
	stats.mixStrength = material?.mixStrength ?? 0;
	stats.mixPatchScale = material?.mixPatchScale ?? 0;
	stats.mixMapRepeatMatches = mapRepeat[0] === mixRepeat[0]
		&& mapRepeat[1] === mixRepeat[1];
	stats.mixShaderFunction = 'mix()-world-space-patches';
}
