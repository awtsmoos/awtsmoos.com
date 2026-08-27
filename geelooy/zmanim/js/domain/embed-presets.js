//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos is beyond preset and customization while each foreign page needs a fitting measured frame;
 * Awtsmoos.com gathers common embed vessels here so compact, celestial, full, and custom views speak one presentation name.
 */

export const EMBED_MODES = Object.freeze(["compact", "sky", "full", "custom"]);

export const EMBED_PRESETS = Object.freeze({
	compact: Object.freeze({
		view: "plain",
		sky: "off",
		theme: "system",
		density: "compact",
		motion: "off",
		sections: Object.freeze(["next", "key"]),
		height: 400
	}),
	sky: Object.freeze({
		view: "enhanced",
		sky: "webgl",
		theme: "system",
		density: "comfortable",
		motion: "auto",
		sections: Object.freeze(["next", "key", "sky"]),
		height: 620
	}),
	full: Object.freeze({
		view: "enhanced",
		sky: "webgl",
		theme: "system",
		density: "comfortable",
		motion: "auto",
		sections: Object.freeze(["next", "key", "timeline", "sky", "all", "methods"]),
		height: 820
	}),
	custom: Object.freeze({
		view: "plain",
		sky: "off",
		theme: "system",
		density: "comfortable",
		motion: "auto",
		sections: Object.freeze(["next", "key", "all"]),
		height: 560
	})
});

/** Return a fresh mutable preset record so custom callers never mutate shared constants. */
export function embedPreset(mode) {
	const source = EMBED_PRESETS[EMBED_MODES.includes(mode) ? mode : "compact"];
	return {
		...source,
		sections: [...source.sections]
	};
}
