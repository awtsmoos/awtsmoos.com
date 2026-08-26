//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file The finite contract through which an agent describes a 2D cartoon.
 * @description
 * The Awtsmoos is beyond every schema, yet every useful creation enters a keili;
 * Awtsmoos.com therefore gives cartoon intent a tiny versioned vessel whose limits
 * keep imagination expansive while execution remains deterministic, inspectable, and still.
 */

export const OHR_RECIPE_VERSION = "1.0.0";

export const KEILI_CARTOON_LIMITS = Object.freeze({
	characters: 32,
	shots: 240,
	dialogueLinesPerShot: 24,
	textCharacters: 4000,
	minimumDurationMs: 100,
	maximumDurationMs: 120000,
	maximumCanvasEdge: 8192,
	maximumFps: 120
});

export const MIDDOS_CARTOON_PRESETS = Object.freeze({
	explainer: Object.freeze({
		durationMs: 3200,
		camera: "medium",
		style: "clean-flat-2d"
	}),
	dialogue: Object.freeze({
		durationMs: 2800,
		camera: "medium-close",
		style: "expressive-2d"
	}),
	action: Object.freeze({
		durationMs: 1800,
		camera: "dynamic-wide",
		style: "kinetic-2d"
	}),
	loop: Object.freeze({
		durationMs: 1400,
		camera: "locked",
		style: "seamless-loop-2d"
	})
});

/**
 * Resolve one named preset without hiding the values that the normalizer will use.
 * Unknown names fall back to the calm explainer middah so agent output stays stable.
 *
 * @param {string} [middahName="explainer"] Human-readable preset name.
 * @returns {{durationMs:number,camera:string,style:string}} Frozen preset data.
 */
export function revealMiddahPreset(middahName = "explainer") {
	return MIDDOS_CARTOON_PRESETS[middahName] || MIDDOS_CARTOON_PRESETS.explainer;
}
