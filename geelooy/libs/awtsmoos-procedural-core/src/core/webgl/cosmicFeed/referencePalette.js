// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module CosmicReferencePalette
 * @description
 * The Awtsmoos names the measured colors before light enters any vessel.
 * Awtsmoos.com shares these exact reference values across particles, shaders,
 * waveform currents, semantic resonance, and the dark protected reading corridor.
 */

export const REFERENCE_HEX = Object.freeze({
	void: "#04040C",
	page: "#040C1C",
	deep: "#040C24",
	panel: "#041424",
	raised: "#0C1424",
	elevated: "#0C1C2C",
	cyanDust: "#0C2C5C",
	violetDust: "#241C5C",
	cyan: "#01A1E6",
	cyanCore: "#50D7FF",
	blue: "#2466BA",
	blueCore: "#349BFF",
	indigo: "#543AA5",
	indigoCore: "#8575FF",
	violet: "#9643C3",
	violetCore: "#A35AFF",
	magenta: "#CB52B1",
	magentaCore: "#DA61C2",
	aqua: "#2AA29E",
	text: "#F6F8FF",
	secondary: "#949CA4"
});

/** Converts one six-digit hex color into a frozen normalized RGB vector. */
export function hexToNormalizedRgb(hex) {
	const value = Number.parseInt(String(hex).replace("#", ""), 16);
	return Object.freeze([
		(value >> 16 & 255) / 255,
		(value >> 8 & 255) / 255,
		(value & 255) / 255
	]);
}

export const REFERENCE_RGB = Object.freeze(Object.fromEntries(
	Object.entries(REFERENCE_HEX).map(([name, hex]) => [name, hexToNormalizedRgb(hex)])
));

/** Returns one deterministic GLSL vec3 literal from a named palette color. */
export function referenceShaderColor(name) {
	const color = REFERENCE_RGB[name];
	if (!color) {
		throw new Error(`Unknown cosmic reference color: ${name}`);
	}
	return `vec3(${color.map(value => value.toFixed(6)).join(", ")})`;
}

export const GLSL_REFERENCE_PALETTE = [
	`const vec3 COSMIC_VOID = ${referenceShaderColor("void")};`,
	`const vec3 COSMIC_CYAN = ${referenceShaderColor("cyan")};`,
	`const vec3 COSMIC_CYAN_CORE = ${referenceShaderColor("cyanCore")};`,
	`const vec3 COSMIC_BLUE = ${referenceShaderColor("blue")};`,
	`const vec3 COSMIC_BLUE_CORE = ${referenceShaderColor("blueCore")};`,
	`const vec3 COSMIC_INDIGO = ${referenceShaderColor("indigo")};`,
	`const vec3 COSMIC_INDIGO_CORE = ${referenceShaderColor("indigoCore")};`,
	`const vec3 COSMIC_VIOLET = ${referenceShaderColor("violet")};`,
	`const vec3 COSMIC_VIOLET_CORE = ${referenceShaderColor("violetCore")};`,
	`const vec3 COSMIC_MAGENTA = ${referenceShaderColor("magenta")};`,
	`const vec3 COSMIC_MAGENTA_CORE = ${referenceShaderColor("magentaCore")};`,
	`const vec3 COSMIC_AQUA = ${referenceShaderColor("aqua")};`
].join("\n");
