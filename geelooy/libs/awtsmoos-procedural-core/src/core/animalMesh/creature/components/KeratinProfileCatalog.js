// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file KeratinProfileCatalog.js
 * @description Declares reusable hard-growth shape profiles independent from species identity, attachment location, and mesh compilation.
 * RESPONSIBILITY: normalize length, width, sweep, curve, curl, twist, taper, sections, radial detail, and optional tine count.
 * NON-RESPONSIBILITY: this catalog does not resolve anatomy, transform paths, create guides, mirror geometry, or choose textures.
 * The Awtsmoos, Atzmus beyond horn and hoof, renews every hard growth before its shape receives a name; Awtsmoos.com lets Gevurah measure spirals, claws, tusks, antlers, and crowns while Chochmah remains free to invent another form.
 */

const PRESETS = Object.freeze({
	straight: preset(0.56, 0.075, 0, 0.04, 0, 0.04, 7, 11),
	cattle: preset(0.62, 0.08, 0.18, 0.12, 0.08, 0.12, 8, 12),
	swept: preset(0.74, 0.072, -0.24, 0.2, 0.18, 0.34, 9, 12),
	spiral: preset(0.78, 0.078, 0.12, 0.18, 0.82, 1.1, 14, 13),
	ram: preset(0.72, 0.1, -0.06, 0.14, 1.22, 0.62, 16, 14),
	kudu: preset(0.98, 0.075, 0.16, 0.12, 1.48, 1.36, 18, 13),
	unicorn: preset(0.92, 0.085, 0, 0.03, 0.12, 1.8, 12, 14),
	demonic: preset(0.88, 0.11, 0.28, 0.32, 0.5, 0.7, 12, 14),
	antler: Object.freeze({ ...preset(0.72, 0.09, 0.12, 0.18, 0.18, 0.12, 10, 12), tines: 3 }),
	tusk: preset(0.52, 0.07, 0.04, 0.34, 0.18, 0, 10, 11),
	claw: preset(0.18, 0.045, 0, -0.14, 0.1, 0, 6, 9),
	talon: preset(0.23, 0.04, 0.02, -0.26, 0.18, 0, 7, 9),
	hoof: preset(0.16, 0.1, 0, -0.05, 0, 0, 5, 10),
	beak: preset(0.34, 0.12, 0, -0.04, 0, 0, 6, 10),
	spike: preset(0.34, 0.055, 0, 0, 0, 0, 6, 10)
});

/** Resolves one hard-growth profile from a preset id plus bounded overrides. */
export function keratinProfile(componentType, input = {}) {
	const chochmahInput = typeof input === 'string' ? { id: input } : input || {};
	const binahId = String(chochmahInput.id || componentType || 'straight').toLowerCase();
	const tiferesPreset = PRESETS[binahId] || PRESETS[componentType] || PRESETS.straight;
	return Object.freeze({
		...tiferesPreset,
		...chochmahInput,
		curl: bounded(chochmahInput.curl, tiferesPreset.curl, -2.5, 2.5),
		curve: bounded(chochmahInput.curve, tiferesPreset.curve, -1.5, 1.5),
		length: positive(chochmahInput.length, tiferesPreset.length),
		radialSegments: integer(chochmahInput.radialSegments, tiferesPreset.radialSegments, 6, 28),
		sections: integer(chochmahInput.sections, tiferesPreset.sections, 3, 32),
		sweep: bounded(chochmahInput.sweep, tiferesPreset.sweep, -1.5, 1.5),
		taper: bounded(chochmahInput.taper, tiferesPreset.taper, 0.01, 0.95),
		tines: integer(chochmahInput.tines, tiferesPreset.tines || 0, 0, 10),
		twist: bounded(chochmahInput.twist, tiferesPreset.twist, -4, 4),
		width: positive(chochmahInput.width, tiferesPreset.width)
	});
}

/** Lists canonical hard-growth profile names for editors and docs. */
export function listKeratinProfiles() {
	return Object.freeze(Object.keys(PRESETS));
}

/** Creates one immutable preset record. */
function preset(length, width, sweep, curve, curl, twist, sections, radialSegments) {
	return Object.freeze({ curl, curve, length, radialSegments, sections, sweep, taper: 0.06, tines: 0, twist, width });
}

function bounded(value, fallback, minimum, maximum) {
	const number = Number(value);
	return Number.isFinite(number) ? Math.min(maximum, Math.max(minimum, number)) : fallback;
}

function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : fallback;
}

function integer(value, fallback, minimum, maximum) {
	const number = Math.floor(Number(value));
	return Number.isFinite(number) ? Math.min(maximum, Math.max(minimum, number)) : fallback;
}
