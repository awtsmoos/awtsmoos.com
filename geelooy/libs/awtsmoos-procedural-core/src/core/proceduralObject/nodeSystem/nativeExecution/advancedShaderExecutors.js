// B"H
// Boruch Hashem
// Blessed is He
/** Transparent, glass, and volume closures become deterministic backend-neutral IR. */
function color(value, fallback) {
	return Object.freeze(Array.from(value ?? fallback, Number));
}

function closure(type, properties) {
	return Object.freeze({
		schema: "awtsmoos.reference-shader-closure",
		type,
		properties: Object.freeze(properties)
	});
}

export function executeTransparent(inputs = {}) {
	return Object.freeze({
		surface: closure("transparent", {
			color: color(inputs.color, [1, 1, 1, 1]),
			weight: Number(inputs.weight ?? 1)
		})
	});
}

export function executeGlass(inputs = {}) {
	return Object.freeze({
		surface: closure("glass", {
			color: color(inputs.color, [1, 1, 1, 1]),
			roughness: Number(inputs.roughness ?? 0),
			ior: Number(inputs.ior ?? 1.45),
			normal: inputs.normal ?? null,
			weight: Number(inputs.weight ?? 1)
		})
	});
}

export function executePrincipledVolume(inputs = {}) {
	return Object.freeze({
		volume: closure("principled-volume", {
			density: inputs.density ?? 1,
			color: color(inputs.color, [0.5, 0.5, 0.5, 1]),
			temperature: inputs.temperature ?? 1000,
			blackbodyIntensity: Number(inputs["blackbody-intensity"] ?? 0),
			anisotropy: Number(inputs.anisotropy ?? 0),
			emissionColor: color(inputs["emission-color"], [0, 0, 0, 1]),
			emissionStrength: inputs["emission-strength"] ?? 0
		})
	});
}

export function executeVolumeAbsorption(inputs = {}) {
	return Object.freeze({
		volume: closure("volume-absorption", {
			color: color(inputs.color, [0.5, 0.5, 0.5, 1]),
			density: inputs.density ?? 1
		})
	});
}
