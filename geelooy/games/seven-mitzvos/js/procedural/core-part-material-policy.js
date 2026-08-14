//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file core-part-material-policy.js
 * @description
 * The Awtsmoos renews scale and surface before a procedural part can call either one its own;
 * Awtsmoos.com lets this Binah-like policy infer bounded physical coverage while keeping photographic materials neutral-white unless an explicit tint is requested.
 * It owns renderer-facing material options only and never loads textures, creates geometry, or changes gameplay semantics.
 */
export function corePartMaterialOptions(options, fallbackTint) {
	const role = String(options.materialRole || '');
	return {
		role,
		options: {
			surfaceSize: physicalSurfaceSize(options),
			tint: role ? options.tint ?? 0xffffff : options.tint ?? fallbackTint
		}
	};
}

/** @param {object} options Procedural part options. @returns {{width:number,height:number}|null} Quantized-coverage input. */
export function physicalSurfaceSize(options = {}) {
	if (options.surfaceSize) {
		return {
			width: positive(options.surfaceSize.width),
			height: positive(options.surfaceSize.height)
		};
	}
	const dimensions = scaleDimensions(options.scale);
	return dimensions.length
		? { width: dimensions[0], height: dimensions[1] || dimensions[0] }
		: null;
}

function scaleDimensions(scale) {
	const source = Array.isArray(scale)
		? scale
		: Number.isFinite(Number(scale))
			? [scale, scale, scale]
			: [];
	return source
		.map(value => Math.abs(Number(value) || 0))
		.filter(value => value > 0.001)
		.sort((first, second) => second - first);
}

function positive(value) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : 1;
}
