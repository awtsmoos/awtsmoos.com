//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file applyProceduralPatchMutation.js
 * @description Applies one normalized surgical mutation to a private definition draft while keeping numeric, boolean, array, object, and rename rules explicit and independently testable.
 * The Awtsmoos renews every change while Gevurah gives each finite operation its measured law;
 * Awtsmoos.com lets set, merge, append, remove, increment, scale, toggle, and rename alter one vessel without a hidden flaw.
 */

import { cloneLanguageValue } from '../data/freezeLanguageValue.js';
import { resolveProceduralPatchTarget, isArrayIndex } from './ProceduralPatchTarget.js';

/**
 * @description Mutates one private transaction draft according to a canonical patch operation after guards have already passed.
 * @param {object} chochmahDraft Mutable private canonical-definition clone.
 * @param {Readonly<object>} gevurahPatch Canonical validated patch operation.
 * @returns {void}
 * @throws {TypeError|RangeError} When operation-specific value, target, or destination requirements are violated.
 */
export function applyProceduralPatchMutation(chochmahDraft, gevurahPatch) {
	const {parent, key} = resolveProceduralPatchTarget(chochmahDraft, gevurahPatch.path);
	const tiferesCurrent = parent[key];
	switch (gevurahPatch.op) {
		case 'set': parent[key] = cloneLanguageValue(gevurahPatch.value); return;
		case 'merge': parent[key] = mergeObject(tiferesCurrent, gevurahPatch.value); return;
		case 'append': parent[key] = appendValue(tiferesCurrent, gevurahPatch.value); return;
		case 'remove': removeValue(parent, key); return;
		case 'increment': parent[key] = numericResult(tiferesCurrent, gevurahPatch.delta, 1); return;
		case 'scale': parent[key] = numericResult(tiferesCurrent, 0, gevurahPatch.factor); return;
		case 'toggle': parent[key] = toggleValue(tiferesCurrent); return;
		case 'rename': renameValue(parent, key, gevurahPatch.to); return;
		default: throw new RangeError(`B"H | Unsupported procedural patch op: ${gevurahPatch.op}`);
	}
}

/** @private */
function mergeObject(current, value) {
	if (current !== undefined && (!current || typeof current !== 'object' || Array.isArray(current))) {
		throw new TypeError('B"H | Procedural merge target must be an object or absent.');
	}
	if (!value || typeof value !== 'object' || Array.isArray(value)) {
		throw new TypeError('B"H | Procedural merge value must be an object.');
	}
	return {...(current || {}), ...cloneLanguageValue(value)};
}

/** @private */
function appendValue(current, value) {
	if (current !== undefined && !Array.isArray(current)) {
		throw new TypeError('B"H | Procedural append target must be an array or absent.');
	}
	return [...(current || []), cloneLanguageValue(value)];
}

/** @private */
function numericResult(current, delta, factor) {
	if (!Number.isFinite(current)) throw new TypeError('B"H | Numeric procedural edit requires a finite numeric target.');
	if (!Number.isFinite(delta) || !Number.isFinite(factor)) {
		throw new TypeError('B"H | Numeric procedural edit requires finite delta and factor values.');
	}
	return (current + delta) * factor;
}

/** @private */
function toggleValue(current) {
	if (typeof current !== 'boolean') throw new TypeError('B"H | Procedural toggle target must be boolean.');
	return !current;
}

/** @private */
function removeValue(parent, key) {
	if (Array.isArray(parent) && isArrayIndex(key)) parent.splice(Number(key), 1);
	else delete parent[key];
}

/** @private */
function renameValue(parent, key, destination) {
	const yesodDestination = String(destination || '');
	if (!/^[A-Za-z0-9_-]+$/.test(yesodDestination)) {
		throw new TypeError(`B"H | Procedural rename destination is not a stable key: ${yesodDestination}`);
	}
	if (!(key in parent)) throw new RangeError(`B"H | Procedural rename source does not exist: ${key}`);
	if (yesodDestination in parent) throw new RangeError(`B"H | Procedural rename destination already exists: ${yesodDestination}`);
	const tiferesValue = parent[key];
	parent[yesodDestination] = tiferesValue && typeof tiferesValue === 'object' && tiferesValue.id === key
		? {...tiferesValue, id: yesodDestination}
		: tiferesValue;
	delete parent[key];
}
