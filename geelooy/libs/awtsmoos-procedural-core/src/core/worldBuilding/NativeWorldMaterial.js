//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file NativeWorldMaterial.js
 * @description Owns reusable native standard-material construction for remote-first physical world surfaces.
 * Products may resolve semantic roles and trusted images, but renderer-facing material creation,
 * physical defaults, layered metadata, and the prohibition on generated replacement imagery belong to Core.
 */
import { MeshStandardMaterial } from '../../adapters/native/runtime.js';

/**
 * Create one native world material from already-resolved semantic surface evidence.
 * Callers retain domain-specific selection and trust decisions; this function owns only reusable
 * renderer materialization and never downloads, paints, synthesizes, or silently substitutes imagery.
 * @param {object} options Physical factors, remote image references, layer metadata, and texture policy.
 * @returns {MeshStandardMaterial} Core-owned native material compatible with the shared renderer.
 */
export function createNativeWorldMaterial(options = {}) {
	const color = normalizeColor(options.color, options.opacity);
	const mapImage = options.mapImage || null;
	const material = new MeshStandardMaterial({
		alphaCutoff: options.alphaCutoff ?? 0.5,
		alphaMode: options.alphaMode || (options.transparent ? 'BLEND' : 'OPAQUE'),
		color,
		doubleSided: Boolean(options.doubleSided),
		name: options.name || 'Awtsmoos Core World Material',
		opacity: options.opacity ?? color[3],
		transparent: Boolean(options.transparent)
	});
	Object.assign(material, surfaceFields(options, mapImage));
	Object.assign(material, layeredFields(options));
	return material;
}

/** Preserve renderer-facing physical fields without giving products constructor authority. */
function surfaceFields(options, mapImage) {
	return {
		alphaToCoverage: options.alphaToCoverage,
		anisotropy: options.anisotropy ?? 3,
		backfaceCull: options.backfaceCull,
		depthWrite: options.depthWrite,
		emissiveStrength: options.emissiveStrength ?? 1.8,
		environmentIntensity: options.environmentIntensity,
		mapImage,
		mapImageFallback: options.mapImageFallback,
		mapRepeat: options.mapRepeat || [1, 1],
		metallicFactor: options.metalness ?? options.metallicFactor ?? 0,
		mixImage: options.mixImage || null,
		mixPatchScale: options.mixPatchScale ?? 0,
		mixPatchSharpness: options.mixPatchSharpness ?? 0.58,
		mixRepeat: options.mixRepeat || options.mapRepeat || [1, 1],
		mixStrength: options.mixStrength ?? 0,
		mixTextureUrl: options.mixTextureUrl || null,
		normalTextureUrl: options.normalTextureUrl || null,
		preferredRole: options.preferredRole || null,
		roughnessFactor: options.roughness ?? options.roughnessFactor ?? 0.72,
		texturePolicy: createTexturePolicy(options, mapImage),
		textureUrl: options.textureUrl || null,
		userData: options.userData
	};
}

/** Copy logical layers so mutable renderer hydration never mutates semantic source recipes. */
function layeredFields(options) {
	if (!Array.isArray(options.textureLayers) || !options.textureLayers.length) return {};
	const layers = options.liveTextureLayers === true
		? options.textureLayers
		: options.textureLayers.map(layer => ({ ...layer }));
	return {
		materialStack: options.materialStack || null,
		textureLayers: layers
	};
}
/** Stamp the non-generated-image covenant while retaining caller-authored semantic metadata. */
function createTexturePolicy(options, mapImage) {
	return {
		...(options.texturePolicy || {}),
		generatedTextureAllowed: false,
		realMapImage: Boolean(mapImage),
		remoteOnly: options.remoteOnly !== false,
		semanticRole: options.semanticRole || options.texturePolicy?.semanticRole || null
	};
}

/** Normalize CSS-style hex or numeric RGBA into the native material's explicit four-channel color. */
function normalizeColor(value = [1, 1, 1, 1], opacity) {
	if (Array.isArray(value)) {
		return [
			Number(value[0] ?? 1),
			Number(value[1] ?? 1),
			Number(value[2] ?? 1),
			Number(opacity ?? value[3] ?? 1)
		];
	}
	const hex = String(value).replace('#', '');
	if (!/^[0-9a-f]{6}$/i.test(hex)) return [1, 1, 1, Number(opacity ?? 1)];
	return [0, 2, 4]
		.map(index => parseInt(hex.slice(index, index + 2), 16) / 255)
		.concat(Number(opacity ?? 1));
}
