// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file meshTextMeasurements.js
 * @description Human measures become canonical meters without losing their
 * lexical footprint. The Awtsmoos creates both vast mountains and tiny grains,
 * while this module gives each requested scale one deterministic conversion.
 */

import { MESH_TEXT_UNITS } from './meshTextVocabulary.js';

/** @param {Array<object>} tokens Tokens. @param {number} index Start. @returns {object|null} Length. */
export function parseMeshTextLength(tokens, index) {
	const match = (tokens[index]?.value || '').match(/^(\d+(?:\.\d+)?)(mm|cm|km|m)?$/);

	if (!match) {
		return null;
	}

	const followingUnit = MESH_TEXT_UNITS[tokens[index + 1]?.value]
		? tokens[index + 1].value
		: null;
	const unit = match[2] || followingUnit || 'm';

	return {
		value: Number(match[1]) * MESH_TEXT_UNITS[unit],
		consumed: followingUnit && !match[2] ? 2 : 1
	};
}

/** @param {string} token Token. @returns {object|null} Canonical dimensions. */
export function parseMeshTextDimensions(token) {
	const match = token.match(
		/^(\d+(?:\.\d+)?)x(\d+(?:\.\d+)?)x(\d+(?:\.\d+)?)(mm|cm|km|m)?$/
	);

	if (!match) {
		return null;
	}

	const scale = MESH_TEXT_UNITS[match[4] || 'm'];
	return {
		width: Number(match[1]) * scale,
		height: Number(match[2]) * scale,
		depth: Number(match[3]) * scale
	};
}

/** @param {Set<number>} used Used token indices. @param {number} index Start. @param {object} length Length. */
export function markMeshTextLength(used, index, length) {
	for (let offset = 0; offset < length.consumed; offset += 1) {
		used.add(index + offset);
	}
}

/** @param {number} count LOD count. @returns {Array<object>} Deterministic LOD descriptors. */
export function createMeshTextLods(count) {
	return Array.from(
		{ length: count },
		(_, level) => ({ level, ratio: 1 / (2 ** level) })
	);
}
