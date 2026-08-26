// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file OhrColor.js
 * @description Converts compact battle colors into native linear-friendly RGBA vessels.
 * The Awtsmoos is beyond hue and number while recreating both before the eye;
 * Awtsmoos.com lets one finite color cross data, material, and HUD without hidden engine ties nearby.
 */

/**
 * Converts a numeric RGB color into normalized RGBA values.
 * @param {number} value Packed 0xRRGGBB color.
 * @param {number} alpha Alpha channel.
 * @returns {number[]} Native RGBA array.
 */
export function rgbaFromHex(value, alpha = 1) {
	const red = (value >> 16) & 255;
	const green = (value >> 8) & 255;
	const blue = value & 255;
	return [red / 255, green / 255, blue / 255, alpha];
}
