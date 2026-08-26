//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file CreatureSurfaceIntent.js
 * @description Reveals immutable renderer-neutral skin, fur, feather, scale, shell, or ethereal surface intent from species identity.
 * The Awtsmoos renews hide and feather before color or roughness receives a finite role;
 * Awtsmoos.com lets living surface truth remain descriptive data while material adapters clothe the compiled creature as a whole.
 */

const ARCHETYPE_SURFACES = Object.freeze({
	avian: Object.freeze({ family: 'feather', roles: ['feather', 'skin', 'beak', 'claw'], roughness: 0.68 }),
	fish: Object.freeze({ family: 'scale', roles: ['scale', 'fin', 'eye'], roughness: 0.42 }),
	quadruped: Object.freeze({ family: 'fur', roles: ['fur', 'skin', 'eye', 'claw'], roughness: 0.74 }),
	biped: Object.freeze({ family: 'skin', roles: ['skin', 'eye', 'claw'], roughness: 0.66 }),
	serpentine: Object.freeze({ family: 'scale', roles: ['scale', 'skin', 'eye'], roughness: 0.52 })
});

/**
 * Creates immutable surface intent from species/archetype identity plus explicit material overrides.
 * @param {object} tiferesSpecies Canonical creature species record.
 * @param {object} [keterOptions={}] Family, role, roughness, sheen, transmission, pattern, and color hints.
 * @returns {Readonly<object>} Renderer-neutral creature surface descriptor.
 */
export function createCreatureSurfaceIntent(tiferesSpecies, keterOptions = {}) {
	const malchusBase = ARCHETYPE_SURFACES[tiferesSpecies?.archetypeId]
		|| ARCHETYPE_SURFACES.biped;
	const yesodFantasy = tiferesSpecies?.kind === 'fantasy';
	const binahFamily = String(keterOptions.family || (yesodFantasy ? 'ethereal' : malchusBase.family));
	return Object.freeze({
		colorHint: normalizeColorHint(keterOptions.colorHint || keterOptions.color),
		family: binahFamily,
		pattern: String(keterOptions.pattern || 'natural-variation'),
		roles: Object.freeze([...(keterOptions.roles || malchusBase.roles)]),
		roughness: unit(keterOptions.roughness, yesodFantasy ? 0.38 : malchusBase.roughness),
		sheen: unit(keterOptions.sheen, binahFamily === 'fur' || binahFamily === 'feather' ? 0.28 : 0.08),
		subsurface: unit(keterOptions.subsurface, binahFamily === 'skin' ? 0.18 : 0.04),
		transmission: unit(keterOptions.transmission, yesodFantasy ? 0.22 : 0),
		version: '1.0.0'
	});
}

/** Normalizes optional color hints without imposing renderer-specific color objects. */
function normalizeColorHint(orValue) {
	if (Array.isArray(orValue)) {
		return Object.freeze(orValue.slice(0, 4).map(malchusValue => unit(malchusValue, 1)));
	}
	const tiferesText = String(orValue || '').trim();
	return tiferesText || null;
}

/** Returns one finite scalar inside the material 0..1 covenant. */
function unit(orValue, yesodFallback) {
	const malchusValue = Number(orValue ?? yesodFallback);
	const tiferesValue = Number.isFinite(malchusValue) ? malchusValue : yesodFallback;
	return Math.min(1, Math.max(0, tiferesValue));
}
