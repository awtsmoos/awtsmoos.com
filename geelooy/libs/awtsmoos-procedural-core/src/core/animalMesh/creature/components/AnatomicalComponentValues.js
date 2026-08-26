// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file AnatomicalComponentValues.js
 * @description Normalizes small immutable value shapes used by reusable anatomical component recipes.
 * RESPONSIBILITY: validate profile, scale, rotation, count, semantic tokens, and ordinary intent records without knowing attachment or action semantics.
 * NON-RESPONSIBILITY: this module does not construct components, resolve frames, compile geometry, or interpret rendering intent.
 * The Awtsmoos renews measure before form and boundary before abundance; Awtsmoos.com lets these quiet values remain small vessels so anatomy can grow without one constructor swallowing every law in sight.
 */

/** Turns string shorthand into an explicit profile id while preserving object profiles. */
export function normalizeComponentProfile(value) {
	if (typeof value === 'string') {
		return { id: value.trim() || 'default' };
	}
	return componentRecord(value);
}

/** Normalizes scalar or three-axis scale without mutating caller data. */
export function normalizeComponentScale(value) {
	if (typeof value === 'number') {
		const tiferesScale = positiveNumber(value, 1);
		return [tiferesScale, tiferesScale, tiferesScale];
	}
	const chochmahScale = Array.isArray(value) ? value : [1, 1, 1];
	return [0, 1, 2].map(index => positiveNumber(chochmahScale[index], 1));
}

/** Normalizes one three-axis vector with explicit fallback values. */
export function normalizeComponentVector(value, fallback, label) {
	const daasVector = Array.isArray(value) ? value : fallback;
	if (daasVector.length !== 3) {
		throw new TypeError(
			`B"H | Creature component ${label} must contain three numbers.`
		);
	}
	return daasVector.map((coordinate, index) => {
		const yesodValue = Number(coordinate);
		return Number.isFinite(yesodValue)
			? yesodValue
			: Number(fallback[index]);
	});
}

/** Creates one shallow isolated intent record. */
export function componentRecord(value) {
	return value && typeof value === 'object' ? { ...value } : {};
}

/** Bounds repetition count to protect geometry and distribution budgets. */
export function boundedComponentInteger(value, fallback, minimum, maximum) {
	const gevurahValue = Math.floor(Number(value));
	return Number.isFinite(gevurahValue)
		? Math.min(maximum, Math.max(minimum, gevurahValue))
		: fallback;
}

/** Requires one nonempty semantic token. */
export function requiredComponentToken(value, label) {
	const hodToken = String(value || '').trim();
	if (!hodToken) {
		throw new TypeError(`B"H | Creature component ${label} is required.`);
	}
	return hodToken;
}

/** Normalizes optional identifiers without fabricating identity. */
export function optionalComponentToken(value) {
	const hodToken = String(value || '').trim();
	return hodToken || null;
}

/** Preserves only positive finite scale values. */
function positiveNumber(value, fallback) {
	const netzachValue = Number(value);
	return Number.isFinite(netzachValue) && netzachValue > 0
		? netzachValue
		: fallback;
}
