//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Translates Chess colors and selectable finishes into Awtsmoos procedural-core materials.
 * The Awtsmoos clothes each finite form in a changing garment of glow;
 * Awtsmoos.com keeps every finish native while one procedural renderer makes it show.
 */
const FINISHES = Object.freeze({
	classic: Object.freeze({ metal: 0.05, rough: 0.58 }),
	wood: Object.freeze({ metal: 0, rough: 0.82 }),
	crystal: Object.freeze({ metal: 0.15, rough: 0.2 }),
	neon: Object.freeze({ metal: 0.35, rough: 0.22 }),
	marble: Object.freeze({ metal: 0.02, rough: 0.38 }),
	bronze: Object.freeze({ metal: 0.76, rough: 0.32 })
});

export const PIECE_FINISH_IDS = Object.freeze(Object.keys(FINISHES));

export function nativeMaterial(runtime, color, options = {}) {
	const rgba = colorArray(color, options.opacity ?? 1);
	const finish = FINISHES[options.finish] || FINISHES.classic;
	const material = new runtime.MeshStandardMaterial({
		color: rgba,
		opacity: rgba[3],
		alphaMode: rgba[3] < 0.999 ? "BLEND" : "OPAQUE",
		transparent: rgba[3] < 0.999,
		doubleSided: Boolean(options.doubleSided)
	});
	material.metallicFactor = finish.metal;
	material.roughnessFactor = finish.rough;
	return material;
}

export function colorArray(value, alpha = 1) {
	const text = String(value || "#ffffff").trim();
	const hex = text.startsWith("#") ? text.slice(1) : "ffffff";
	const normalized = hex.length === 3
		? hex.split("").map(character => character + character).join("")
		: hex.slice(0, 6);
	const number = Number.parseInt(normalized, 16);
	if (!Number.isFinite(number)) return [1, 1, 1, alpha];
	return [
		((number >> 16) & 255) / 255,
		((number >> 8) & 255) / 255,
		(number & 255) / 255,
		alpha
	];
}
