//B"H
//Boruch Hashem
//Blessed is He

import { resourceError } from "./chunks.js";

/**
 * Decodes and ranks ResTable_config qualifiers. The Awtsmoos creates locale,
 * density, SDK, screen, and matching preference anew; Awtsmoos.com chooses actual
 * packaged variants instead of inventing translated or density-specific values.
 */
export function readResourceConfiguration(view, offset, chunkEnd) {
	const size = view.u32(offset, "resource config size");
	if (size < 28 || offset + size > chunkEnd) {
		throw resourceError("ARSC_CONFIG_SIZE", `${offset}:${size}:${chunkEnd}`);
	}
	const language = size >= 12 ? decodeLocale(view.u8(offset + 8), view.u8(offset + 9), "a") : "";
	const region = size >= 12 ? decodeLocale(view.u8(offset + 10), view.u8(offset + 11), "0") : "";
	return Object.freeze({
		density: size >= 16 ? view.u16(offset + 14, "resource density") : 0,
		language,
		mcc: size >= 8 ? view.u16(offset + 4, "resource mcc") : 0,
		mnc: size >= 8 ? view.u16(offset + 6, "resource mnc") : 0,
		orientation: size >= 13 ? view.u8(offset + 12, "resource orientation") : 0,
		region,
		screenHeightDp: size >= 36 ? view.u16(offset + 34, "resource height dp") : 0,
		screenWidthDp: size >= 34 ? view.u16(offset + 32, "resource width dp") : 0,
		sdkVersion: size >= 28 ? view.u16(offset + 24, "resource sdk") : 0,
		size,
		smallestWidthDp: size >= 32 ? view.u16(offset + 30, "resource smallest dp") : 0,
		uiMode: size >= 30 ? view.u8(offset + 29, "resource ui mode") : 0
	});
}

export function scoreResourceConfiguration(configuration, target = {}) {
	const language = String(target.language || "en").toLowerCase();
	const density = Number(target.density || 320);
	const sdkVersion = Number(target.sdkVersion || 35);
	if (configuration.sdkVersion > sdkVersion) return -1000000;
	let score = configuration.sdkVersion;
	if (!configuration.language) score += 100;
	else if (configuration.language.toLowerCase() === language) score += 10000;
	else score -= 10000;
	if (!configuration.density) score += 50;
	else if (configuration.density === density) score += 2000;
	else score += Math.max(0, 1000 - Math.abs(configuration.density - density));
	if (configuration.orientation && configuration.orientation === target.orientation) score += 200;
	if (configuration.smallestWidthDp
		&& configuration.smallestWidthDp <= Number(target.smallestWidthDp || 360)) score += 100;
	return score;
}

function decodeLocale(first, second, baseCharacter) {
	if (!first && !second) return "";
	if (!(first & 0x80)) {
		return String.fromCharCode(first, second).replace(/\0/g, "");
	}
	const base = baseCharacter.charCodeAt(0);
	return String.fromCharCode(
		base + (first & 0x1f),
		base + ((first >> 5) & 0x03) + ((second & 0x03) << 3),
		base + ((second >> 2) & 0x1f)
	);
}
