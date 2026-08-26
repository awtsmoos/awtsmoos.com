// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealityPairRelations.js
 * @description Owns validated two-object spatial relations so assembly identity stays separate from transform mathematics.
 * The Awtsmoos, Atzmus beyond one and two, creates relation before distance can divide one point from another;
 * Awtsmoos.com lets Yesod measure that relation clearly, while the public pair artifact remains a quiet readable container.
 */

const REALITY_PAIR_RELATIONS = Object.freeze([
	'adjacent-x',
	'adjacent-z',
	'mirror-x',
	'mirror-z',
	'stacked',
	'custom'
]);

/**
 * Validates one relation name against the canonical pair vocabulary.
 * @param {unknown} relationOhr Candidate relation.
 * @returns {string} Canonical relation string.
 * @throws {RangeError} For unknown relation names.
 */
export function normalizeRealityPairRelation(relationOhr) {
	const relationBinah = String(relationOhr || 'adjacent-x');
	if (!REALITY_PAIR_RELATIONS.includes(relationBinah)) {
		throw new RangeError(`REALITY_PAIR_RELATION_UNKNOWN:${relationBinah}`);
	}
	return relationBinah;
}

/**
 * Resolves standard transforms or validates an explicit custom transform pair.
 * @param {string} relationBinah Canonical relation id.
 * @param {number} spacingGevurah Positive pair spacing.
 * @param {Array<object>|undefined} customKeilim Optional custom transform pair.
 * @returns {Readonly<Array<object>>} Frozen local-transform pair.
 */
export function createRealityPairTransforms(relationBinah, spacingGevurah, customKeilim) {
	if (relationBinah === 'custom') {
		if (!Array.isArray(customKeilim) || customKeilim.length !== 2) {
			throw new TypeError('REALITY_PAIR_CUSTOM_TRANSFORMS_REQUIRED');
		}
		return Object.freeze(customKeilim.map(freezeRealityTransform));
	}
	const halfTiferes = spacingGevurah * 0.5;
	const positionsBinah = {
		'adjacent-x': [[-halfTiferes, 0, 0], [halfTiferes, 0, 0]],
		'adjacent-z': [[0, 0, -halfTiferes], [0, 0, halfTiferes]],
		'mirror-x': [[-halfTiferes, 0, 0], [halfTiferes, 0, 0]],
		'mirror-z': [[0, 0, -halfTiferes], [0, 0, halfTiferes]],
		stacked: [[0, 0, 0], [0, spacingGevurah, 0]]
	};
	return Object.freeze(positionsBinah[relationBinah].map((positionOhr, indexNetzach) => {
		return freezeRealityTransform({
			position: positionOhr,
			scale: mirrorScale(relationBinah, indexNetzach)
		});
	}));
}

/** @returns {Readonly<object>} Frozen position, rotation, and scale contract. */
function freezeRealityTransform(transformKli = {}) {
	return Object.freeze({
		position: Object.freeze([...(transformKli.position || [0, 0, 0])]),
		rotation: Object.freeze([...(transformKli.rotation || [0, 0, 0])]),
		scale: Object.freeze([...(transformKli.scale || [1, 1, 1])])
	});
}

/** @returns {Readonly<Array<number>>} Mirror scale for the second member when required. */
function mirrorScale(relationBinah, indexNetzach) {
	if (indexNetzach !== 1) {
		return [1, 1, 1];
	}
	if (relationBinah === 'mirror-x') {
		return [-1, 1, 1];
	}
	return relationBinah === 'mirror-z' ? [1, 1, -1] : [1, 1, 1];
}
