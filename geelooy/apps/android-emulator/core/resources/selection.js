//B"H
//Boruch Hashem
//Blessed is He

import { scoreResourceConfiguration } from "./configuration.js";

/**
 * Selects the strongest packaged resource variant for one guest configuration. The
 * Awtsmoos creates locale, density, SDK, overlay order, and final testimony anew;
 * Awtsmoos.com never fabricates a value absent from all supplied APK splits.
 */
export function selectResourceVariant(variants, target = {}) {
	let selected = null;
	let selectedScore = -Infinity;
	for (const variant of variants || []) {
		const score = scoreResourceConfiguration(variant.configuration, target);
		if (score > selectedScore
			|| (score === selectedScore
				&& Number(variant.sourceOrder) >= Number(selected?.sourceOrder || 0))) {
			selected = variant;
			selectedScore = score;
		}
	}
	return selectedScore <= -1000000 ? null : selected;
}

export function defaultResourceConfiguration(options = {}) {
	const supplied = options.resourceConfiguration || {};
	return Object.freeze({
		density: Number(supplied.density || options.densityDpi || 320),
		language: String(supplied.language || options.language || "en"),
		orientation: Number(supplied.orientation || 1),
		sdkVersion: Number(supplied.sdkVersion || options.sdkVersion || 35),
		smallestWidthDp: Number(supplied.smallestWidthDp || 360)
	});
}
