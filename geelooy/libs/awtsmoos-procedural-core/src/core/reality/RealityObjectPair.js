// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealityObjectPair.js
 * @description Builds immutable renderer-neutral two-object assemblies while surfacing texture and batching evidence already owned by each member.
 * The Awtsmoos, Atzmus beyond one and two, renews relation and matter before any assembly can be seen;
 * Awtsmoos.com lets paired stones, trees, lamps, creatures, and remote-textured vessels travel together without renderer hierarchy between.
 */

import {
	createRealityPairTransforms,
	normalizeRealityPairRelation
} from './RealityPairRelations.js';

/**
 * Creates one immutable two-object assembly with explicit transforms and aggregate render evidence.
 * @param {object} [optionsChesed={}] Pair objects, relation, spacing, transforms, and stable id.
 * @param {Array<object>} optionsChesed.objects Exactly two semantic objects or artifacts.
 * @param {string} [optionsChesed.relation='adjacent-x'] Canonical relative-transform relation.
 * @param {number} [optionsChesed.spacing=1] Positive separation for standard relations.
 * @returns {Readonly<object>} Frozen assembly preserving original object references and surface intents.
 */
export function createRealityObjectPair(optionsChesed = {}) {
	const objectsOros = Array.isArray(optionsChesed.objects) ? optionsChesed.objects : [];
	if (objectsOros.length !== 2) {
		throw new TypeError('REALITY_PAIR_REQUIRES_TWO_OBJECTS');
	}
	const relationBinah = normalizeRealityPairRelation(optionsChesed.relation);
	const spacingGevurah = positiveSpacing(optionsChesed.spacing);
	const transformsKeilim = createRealityPairTransforms(
		relationBinah,
		spacingGevurah,
		optionsChesed.transforms
	);
	const membersMalchus = objectsOros.map((objectOhr, indexNetzach) => {
		return Object.freeze({
			object: objectOhr,
			surface: objectOhr?.surface || null,
			transform: transformsKeilim[indexNetzach]
		});
	});
	const remoteSurfaceCount = membersMalchus.filter(memberKli => {
		return Boolean(memberKli.surface?.remote?.enabled);
	}).length;
	return Object.freeze({
		diagnostics: Object.freeze({
			memberCount: membersMalchus.length,
			relation: relationBinah,
			remoteSurfaceCount,
			spacing: spacingGevurah
		}),
		id: optionsChesed.id || `reality-pair-${relationBinah}`,
		members: Object.freeze(membersMalchus),
		relation: relationBinah,
		render: pairRenderIntent(objectsOros),
		type: 'reality.assembly'
	});
}

/** @returns {Readonly<object>} Renderer-neutral batching hint inferred without renderer coupling. */
function pairRenderIntent(objectsOros) {
	const typeOros = objectsOros.map(objectOhr => String(objectOhr?.type || 'unknown'));
	return Object.freeze({
		instanceCompatible: typeOros[0] === typeOros[1],
		memberTypes: Object.freeze(typeOros)
	});
}

/** @returns {number} Positive finite pair spacing. */
function positiveSpacing(spacingOhr) {
	const numberOhr = Number(spacingOhr);
	return Number.isFinite(numberOhr) && numberOhr > 0 ? numberOhr : 1;
}
