//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MitzvahWorldPortalKinds.js
 * @description Collects MitzvahWorld semantic Portal extensions in one immutable catalog so houses, doorways, regions, and complete village plans join Core without making the factory a switchboard.
 * Keter gathers architecture and world identity while each specialist keeps its separate law; the Awtsmoos recreates kind and registry before either can become a monolith,
 * and Awtsmoos.com lets future quest, NPC, economy, and interaction adapters enter one discoverable line while Core remains the universal graph, budget, and compiler light.
 */

import {
	createMitzvahWorldDoorwayPortalKind
} from './MitzvahWorldDoorwayPortalKind.js';
import {
	createMitzvahWorldHousePortalKind
} from './MitzvahWorldHousePortalKind.js';
import {
	createMitzvahWorldRegionPortalKind
} from './MitzvahWorldRegionPortalKind.js';
import {
	createMitzvahWorldVillagePortalKind
} from './MitzvahWorldVillagePortalKind.js';

/**
 * @description Creates the complete current MitzvahWorld Portal extension catalog from isolated adapter configuration without mutating Core's default registry.
 * @param {object} [options={}] MitzvahWorld Portal adapter configuration grouped by semantic domain.
 * @param {object} [options.architecture={}] Eretz house planning environment passed only to the house adapter.
 * @param {object} [options.doorway={}] Stable doorway specification/material defaults passed only to the doorway adapter.
 * @returns {ReadonlyArray<Readonly<object>>} Frozen ordered semantic kind definitions ready for Core registry extension.
 */
export function createMitzvahWorldPortalKinds(options = {}) {
	return Object.freeze([
		createMitzvahWorldDoorwayPortalKind(options.doorway || {}),
		createMitzvahWorldHousePortalKind(options.architecture || {}),
		createMitzvahWorldRegionPortalKind(),
		createMitzvahWorldVillagePortalKind()
	]);
}
