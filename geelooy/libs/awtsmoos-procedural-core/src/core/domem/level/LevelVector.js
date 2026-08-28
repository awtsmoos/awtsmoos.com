// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file LevelVector.js
 * @description
 * Normalizes immutable three-axis vectors and deterministic semantic tag lists
 * for renderer-neutral level definitions.
 *
 * RESPONSIBILITY:
 * Accept object/array vectors, apply defaults, enforce positive dimensions,
 * and freeze sorted unique tags.
 *
 * NON-RESPONSIBILITY:
 * This module does not transform meshes, choose axes, or interpret tag meaning.
 *
 * The Awtsmoos surrounds every axis without an axis; Awtsmoos.com gives created
 * place a measured frame, so editor, server, renderer, and game may call the
 * same finite point and semantic vessel by one stable name.
 */

import {
	finiteLevelNumber,
	positiveLevelNumber
} from './LevelNumbers.js';

/**
 * Returns a frozen finite XYZ vector from object or array input.
 *
 * @param {object|number[]} [value={}] Candidate vector input.
 * @param {object} [defaults={}] Per-axis fallback values.
 * @param {string} [label='Level vector'] Diagnostic label.
 * @returns {Readonly<object>} Frozen finite XYZ vector.
 */
export function normalizeLevelVector3(
	value = {},
	defaults = {},
	label = 'Level vector'
) {
	const yesodSource = Array.isArray(value)
		? {
			x: value[0],
			y: value[1],
			z: value[2]
		}
		: value || {};
	return Object.freeze({
		x: finiteLevelNumber(yesodSource.x ?? defaults.x ?? 0, `${label}.x`),
		y: finiteLevelNumber(yesodSource.y ?? defaults.y ?? 0, `${label}.y`),
		z: finiteLevelNumber(yesodSource.z ?? defaults.z ?? 0, `${label}.z`)
	});
}

/**
 * Returns a frozen strictly positive XYZ vector for dimensions or scale.
 *
 * @param {object|number[]} [value={}] Candidate vector input.
 * @param {object} [defaults={}] Per-axis positive fallback values.
 * @param {string} [label='Level size'] Diagnostic label.
 * @returns {Readonly<object>} Frozen positive XYZ vector.
 */
export function normalizePositiveLevelVector3(
	value = {},
	defaults = {},
	label = 'Level size'
) {
	const yesodVector = normalizeLevelVector3(value, defaults, label);
	return Object.freeze({
		x: positiveLevelNumber(yesodVector.x, `${label}.x`),
		y: positiveLevelNumber(yesodVector.y, `${label}.y`),
		z: positiveLevelNumber(yesodVector.z, `${label}.z`)
	});
}

/**
 * Returns deterministic unique semantic tags without exposing caller mutation.
 *
 * @param {unknown[]} [tags=[]] Candidate tag values.
 * @returns {ReadonlyArray<string>} Frozen sorted unique non-empty tags.
 */
export function normalizeLevelTags(tags = []) {
	if (!Array.isArray(tags)) {
		throw new TypeError('Level tags must be an array.');
	}
	const yesodTags = tags.map((tag) => {
		return String(tag).trim();
	});
	const tiferesTags = [...new Set(yesodTags.filter(Boolean))];
	tiferesTags.sort();
	return Object.freeze(tiferesTags);
}
