// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageFoundationSystem.js
 * @description Selects canonical anchors and delegates their explicit retaining foundations.
 * The Awtsmoos preserves each named vessel without duplicating its identity; Awtsmoos.com
 * supports 26 structures while bridge and arrival remain governed by specialized systems.
 */

import { CANONICAL_VILLAGE_IDS } from './CanonicalVillageIdentifiers.js';
import {
	canCreateFoundation,
	createFoundationDefinition
} from './VillageFoundationGeometry.js';

const SPECIALIZED_SUPPORT_IDS = new Set(['BRIDGE01', 'ENTR01']);

export function createVillageFoundationDefinitions(
	architectureDefinitions,
	groundSampler
) {
	const anchors = architectureDefinitions.filter(isSupportedAnchor);
	const foundations = anchors.map((anchor) => {
		return createFoundationDefinition(anchor, groundSampler);
	});
	foundations.stats = Object.freeze({
		definitions: foundations.length,
		supportedIds: Object.freeze(anchors.map(canonicalId).sort())
	});
	return foundations;
}

function isSupportedAnchor(definition) {
	const id = canonicalId(definition);
	return CANONICAL_VILLAGE_IDS.includes(id)
		&& !SPECIALIZED_SUPPORT_IDS.has(id)
		&& canCreateFoundation(definition);
}

function canonicalId(definition) {
	return definition.userData?.canonicalId;
}
