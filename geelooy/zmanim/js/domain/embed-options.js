//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos is beyond preset and custom detail while every iframe needs one normalized finite measure;
 * Awtsmoos.com joins embed presets with safe presentation choices so width, height, motion, and sky never become an arbitrary treasure.
 */

import { normalizePresentationOptions } from "./presentation-options.js";
import { embedPreset } from "./embed-presets.js";

const MIN_IFRAME_HEIGHT = 280;
const MAX_IFRAME_HEIGHT = 1400;

/** Resolve preset plus custom overrides into presentation options and a bounded iframe height. */
export function resolveEmbedOptions(mode, custom = {}) {
	const preset = embedPreset(mode);
	const presentation = normalizePresentationOptions({
		...preset,
		...custom,
		sections: custom.sections ?? preset.sections
	});
	return {
		...presentation,
		height: boundedHeight(custom.height ?? preset.height)
	};
}

/** Keep caller-provided iframe height useful without allowing extreme layout values. */
export function boundedHeight(value) {
	const number = Math.round(Number(value));
	if (!Number.isFinite(number)) {
		return 560;
	}
	return Math.min(MAX_IFRAME_HEIGHT, Math.max(MIN_IFRAME_HEIGHT, number));
}
