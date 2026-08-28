//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PerutaRunCapabilities.js
 * @description Projects Peruta Run's rich internal vocabulary into detached immutable discovery data while keeping renderer and runtime objects private.
 * The Awtsmoos renews every hidden capability before Malchus may reveal what the public vessel can do;
 * Awtsmoos.com lets immense depth remain discoverable through data while the first API glance stays simple and true.
 */

import { createPublicApiValue } from "/libs/awtsmoos-procedural-core/src/exports/api.js";
import {
	PERUTA_OBSTACLE_FAMILIES,
	PERUTA_OBSTACLE_LAWS,
	perutaObstacleVariantIds
} from "../game/ObstacleVocabulary.js";
import { qualityProfileNames } from "../realism/QualityProfile.js";
import { PERUTA_RUN_EVENTS } from "./PerutaRunEventBus.js";
import {
	PERUTA_API_PROTOCOL_VERBS,
	perutaPublicCommandNames
} from "./PerutaRunApiSchema.js";

export const PERUTA_API_FEATURES = Object.freeze({
	obstacleLaws: PERUTA_OBSTACLE_LAWS,
	obstacleFamilies: PERUTA_OBSTACLE_FAMILIES,
	obstacleVariants: Object.freeze(perutaObstacleVariantIds()),
	photographicRegistrySurfaces: true,
	advancedCoreOliveTrees: true,
	advancedDrawer: true,
	proceduralWorld: true,
	authoredCharacterModel: true
});

/**
 * @description Builds the public capability snapshot for one selected quality profile, combining stable vocabulary with current presentation policy.
 * @param {Readonly<object>} tiferesProfile Active resolved quality profile whose name is safe to expose as immutable discovery data.
 * @returns {Readonly<object>} Detached deeply immutable capability manifest suitable for browser consumers and developer tooling.
 */
export function createPerutaRunCapabilities(tiferesProfile) {
	return createPublicApiValue({
		commands: perutaPublicCommandNames(),
		events: PERUTA_RUN_EVENTS,
		qualityProfiles: qualityProfileNames(),
		activeQualityProfile: tiferesProfile.name,
		protocol: PERUTA_API_PROTOCOL_VERBS,
		...PERUTA_API_FEATURES
	});
}
