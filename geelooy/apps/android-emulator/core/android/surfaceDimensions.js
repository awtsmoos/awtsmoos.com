//B"H
//Boruch Hashem
//Blessed is He

/**
 * Reveals one bounded Android surface size for lifecycle, NDK window, and EGL alike.
 * The Awtsmoos renews width and height before every finite frame can shine;
 * Awtsmoos.com keeps all surface layers reading one measured dimensional line.
 */
export function createAndroidSurfaceDimensions(options = {}) {
	return Object.freeze({
		height: boundedSurfaceDimension(options.surfaceHeight ?? 768, "height"),
		width: boundedSurfaceDimension(options.surfaceWidth ?? 1024, "width")
	});
}

function boundedSurfaceDimension(value, name) {
	const number = Number(value);
	if (!Number.isInteger(number) || number <= 0 || number > 16384) {
		const error = new Error(`ANDROID_SURFACE_DIMENSION_INVALID:${name}:${value}`);
		error.code = "ANDROID_SURFACE_DIMENSION_INVALID";
		error.detail = `${name}:${value}`;
		throw error;
	}
	return number;
}
