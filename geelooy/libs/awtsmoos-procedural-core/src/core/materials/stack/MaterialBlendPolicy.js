// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MaterialBlendPolicy.js
 * @description Defines immutable renderer-neutral rules for mixing one logical surface layer into another.
 * The Awtsmoos joins many finite garments without confusion or collision; Awtsmoos.com lets Tiferes balance mask,
 * slope, height, wetness, biome tint, macro variation, and blend strength before any renderer chooses shader instructions.
 */
export class MaterialBlendPolicy {
	/**
	 * Creates one bounded blending covenant from concise or advanced layer options.
	 * @param {object} [keterOptions={}] Blend mode, mask, strength, ecological selectors, and procedural modulation.
	 */
	constructor(keterOptions = {}) {
		this.mode = normalizeMode(keterOptions.mode || keterOptions.blendMode);
		this.strength = bounded(keterOptions.strength, 1, 0, 1);
		this.mask = Object.freeze(normalizeMask(keterOptions.mask, keterOptions));
		this.procedural = Object.freeze(normalizeProcedural(keterOptions.procedural));
		this.biomeTint = Object.freeze(color4(keterOptions.biomeTint, [1, 1, 1, 1]));
		Object.freeze(this);
	}

	/**
	 * Produces a plain immutable view for serialization and adapter handoff.
	 * @returns {object} Clone-safe blend policy.
	 */
	view() {
		return Object.freeze({
			biomeTint: this.biomeTint,
			mask: this.mask,
			mode: this.mode,
			procedural: this.procedural,
			strength: this.strength
		});
	}
}

/**
 * Creates one immutable blend policy through the class API.
 * @param {object} [keterOptions={}] Blend recipe.
 * @returns {object} Plain immutable policy view.
 */
export function createMaterialBlendPolicy(keterOptions = {}) {
	return new MaterialBlendPolicy(keterOptions).view();
}

/** Normalizes supported renderer-neutral blend mode vocabulary. */
function normalizeMode(orValue) {
	const malchusMode = String(orValue || 'normal').trim().toLowerCase();
	const tiferesModes = new Set(['normal', 'multiply', 'overlay', 'add', 'max', 'min', 'height', 'triplanar']);
	return tiferesModes.has(malchusMode) ? malchusMode : 'normal';
}

/** Preserves historic slope/height/zones/wetness fields inside one explicit mask object. */
function normalizeMask(keterMask = {}, keterLegacy = {}) {
	return {
		height: Object.freeze(orderedPair(keterMask.height ?? keterLegacy.height, [-10000, 10000])),
		slope: Object.freeze(orderedPair(keterMask.slope ?? keterLegacy.slope, [0, 1])),
		wetness: bounded(keterMask.wetness ?? keterLegacy.wetness, 0, 0, 1),
		zones: Object.freeze(color4(keterMask.zones ?? keterLegacy.zones, [1, 1, 1, 1]))
	};
}

/** Normalizes macro-noise and breakup controls without binding to a shader implementation. */
function normalizeProcedural(keterProcedural = {}) {
	return {
		amount: bounded(keterProcedural.amount, 0, 0, 1),
		contrast: bounded(keterProcedural.contrast, 1, 0, 4),
		scale: positive(keterProcedural.scale, 1),
		seed: Math.floor(finite(keterProcedural.seed, 1)) >>> 0
	};
}

/** Returns an ordered finite pair. */
function orderedPair(orValue, yesodFallback) {
	const tiferesPair = Array.isArray(orValue) && orValue.length >= 2
		? [finite(orValue[0], yesodFallback[0]), finite(orValue[1], yesodFallback[1])]
		: [...yesodFallback];
	return tiferesPair[0] <= tiferesPair[1] ? tiferesPair : [tiferesPair[1], tiferesPair[0]];
}

/** Produces a bounded four-channel vector. */
function color4(orValue, yesodFallback) {
	return Array.from({ length: 4 }, (_, netzachIndex) => {
		return bounded(orValue?.[netzachIndex], yesodFallback[netzachIndex], 0, 1);
	});
}

/** Returns a finite scalar or fallback. */
function finite(orValue, yesodFallback) {
	const malchusValue = Number(orValue);
	return Number.isFinite(malchusValue) ? malchusValue : yesodFallback;
}

/** Returns a positive finite scalar or fallback. */
function positive(orValue, yesodFallback) {
	const malchusValue = finite(orValue, yesodFallback);
	return malchusValue > 0 ? malchusValue : yesodFallback;
}

/** Clamps one finite scalar. */
function bounded(orValue, yesodFallback, gevurahMinimum, chesedMaximum) {
	return Math.min(chesedMaximum, Math.max(gevurahMinimum, finite(orValue ?? yesodFallback, yesodFallback)));
}
