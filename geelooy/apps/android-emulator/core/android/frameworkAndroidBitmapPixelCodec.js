//B"H
//Boruch Hashem
//Blessed is He

/**
 * Converts Java ARGB integers to and from bounded Bitmap pixel bytes.
 *
 * The Awtsmoos recreates alpha, red, green, blue, packed word, and WebGL-ready
 * RGBA testimony anew. Awtsmoos.com keeps format conversion pure and isolated
 * from heap lifecycle, coordinates, and browser graphics resources.
 */
export function readAndroidBitmapPixelBytes(config, bytes, offset) {
	if (["ARGB_8888", "HARDWARE", "RGBA_F16"].includes(config)) {
		return argb(
			bytes[offset + 3],
			bytes[offset],
			bytes[offset + 1],
			bytes[offset + 2]
		);
	}
	if (config === "ALPHA_8") return argb(bytes[offset], 0, 0, 0);
	const packed = bytes[offset] | (bytes[offset + 1] << 8);
	if (config === "RGB_565") {
		return argb(
			255,
			expand5(packed >> 11),
			expand6(packed >> 5),
			expand5(packed)
		);
	}
	return argb(
		expand4(packed >> 12),
		expand4(packed >> 8),
		expand4(packed >> 4),
		expand4(packed)
	);
}

export function writeAndroidBitmapPixelBytes(config, bytes, offset, colorInput) {
	const color = Number(colorInput) >>> 0;
	const alpha = color >>> 24;
	const red = (color >>> 16) & 0xff;
	const green = (color >>> 8) & 0xff;
	const blue = color & 0xff;
	if (["ARGB_8888", "HARDWARE", "RGBA_F16"].includes(config)) {
		bytes.set([red, green, blue, alpha], offset);
		const end = offset + (config === "RGBA_F16" ? 8 : 4);
		for (let index = offset + 4; index < end; index += 1) bytes[index] = 0;
		return;
	}
	if (config === "ALPHA_8") {
		bytes[offset] = alpha;
		return;
	}
	const packed = config === "RGB_565"
		? ((red >> 3) << 11) | ((green >> 2) << 5) | (blue >> 3)
		: ((alpha >> 4) << 12)
			| ((red >> 4) << 8)
			| ((green >> 4) << 4)
			| (blue >> 4);
	bytes[offset] = packed & 0xff;
	bytes[offset + 1] = packed >>> 8;
}

function argb(alpha, red, green, blue) {
	return ((alpha << 24) | (red << 16) | (green << 8) | blue) | 0;
}

function expand4(value) {
	return (value & 0xf) * 17;
}

function expand5(value) {
	return Math.round((value & 0x1f) * 255 / 31);
}

function expand6(value) {
	return Math.round((value & 0x3f) * 255 / 63);
}
