//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file nativeSvgImage.js
 * @description
 * Converts user-provided SVG text into a browser-native Image without Canvg,
 * packages, CDNs, or external rendering code. Object URLs exist only for the
 * lifetime of a single decode and are always revoked after the image is ready.
 */

/**
 * Decodes SVG markup through the browser's built-in SVG image implementation.
 *
 * @param {string} svgText Complete SVG markup.
 * @returns {Promise<HTMLImageElement>} Decoded image safe to draw on canvas.
 */
export async function decodeSvgImage(svgText) {
	const markup = String(svgText || "").trim();
	if (!markup) {
		throw new Error("empty_svg_markup");
	}
	const blob = new Blob([markup], {
		type: "image/svg+xml;charset=utf-8"
	});
	const objectUrl = URL.createObjectURL(blob);
	try {
		const image = new Image();
		image.decoding = "async";
		image.src = objectUrl;
		await decodeImage(image);
		return image;
	} finally {
		URL.revokeObjectURL(objectUrl);
	}
}

/**
 * Uses `decode()` where supported and falls back to load/error events otherwise.
 *
 * @param {HTMLImageElement} image Browser image receiving the temporary object URL.
 * @returns {Promise<void>} Resolves only when intrinsic SVG pixels are available.
 */
async function decodeImage(image) {
	if (typeof image.decode === "function") {
		await image.decode();
		return;
	}
	await new Promise((resolve, reject) => {
		image.addEventListener("load", resolve, { once: true });
		image.addEventListener("error", () => {
			reject(new Error("svg_decode_failed"));
		}, { once: true });
	});
}
