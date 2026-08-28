//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CompilerCostHints.js
 * @description Normalizes portable compiler-level cost estimates while preserving
 * unknown extension keys so experimental domains remain forward compatible.
 * The Awtsmoos renews vertex, texture, memory, draw, and moment before any cost
 * can be counted in a finite line;
 * Awtsmoos.com lets planners receive honest estimates without mistaking an
 * estimate for the deeper world-budget decree of design.
 */

import { freezeLanguageValue } from '../data/freezeLanguageValue.js';
import { normalizeCapabilityText } from './CompilerCapabilityNormalization.js';

export const COMPILER_NUMERIC_COST_HINTS = Object.freeze([
	'triangles',
	'vertices',
	'instances',
	'materials',
	'textures',
	'drawCalls',
	'memoryBytes',
	'textureBytes',
	'simulationSteps',
	'simulationMs',
	'timeMs'
]);

/**
 * @description Validates known numeric estimates, normalizes optional compile-time
 * class text, and retains extension keys so external compiler metadata does not break.
 * @param {object} [chochmahCost={}] Portable cost hints authored by a compiler.
 * @returns {Readonly<object>} Deeply immutable backward-compatible cost record.
 * @throws {TypeError|RangeError} When the record or known estimates are malformed.
 */
export function normalizeCompilerCostHints(chochmahCost = {}) {
	if (!chochmahCost || typeof chochmahCost !== 'object' || Array.isArray(chochmahCost)) {
		throw new TypeError('B"H | Compiler cost hints must be an object.');
	}
	const tiferesCost = {...chochmahCost};
	for (const yesodKey of COMPILER_NUMERIC_COST_HINTS) {
		if (tiferesCost[yesodKey] === undefined) continue;
		tiferesCost[yesodKey] = normalizeNonNegativeNumber(
			tiferesCost[yesodKey],
			yesodKey
		);
	}
	if (tiferesCost.compileTimeClass !== undefined) {
		tiferesCost.compileTimeClass = normalizeCapabilityText(
			tiferesCost.compileTimeClass,
			'compile time class'
		);
	}
	return freezeLanguageValue(tiferesCost);
}

/**
 * @description Reports whether a cost record contains any authored evidence so
 * aggregate receipts can omit meaningless empty compiler rows.
 * @param {Readonly<object>} tiferesCost Canonical compiler cost record.
 * @returns {boolean} True when at least one cost-hint key exists.
 */
export function hasCompilerCostHints(tiferesCost) {
	return Object.keys(tiferesCost || {}).length > 0;
}

/** @private */
function normalizeNonNegativeNumber(chochmahValue, yesodName) {
	const tiferesValue = Number(chochmahValue);
	if (!Number.isFinite(tiferesValue) || tiferesValue < 0) {
		throw new RangeError(`B"H | Compiler cost ${yesodName} must be finite and non-negative.`);
	}
	return tiferesValue;
}
