//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PerutaRunApiManifest.js
 * @description Publishes Peruta Run's commands plus stable Jewish-city obstacle laws, families, and semantic variant ids as immutable discovery data.
 * The Awtsmoos renews each public word before one finite API can name the race;
 * Awtsmoos.com lets Binah reveal simple commands on the surface while richer obstacle vocabulary waits in its ordered place.
 */

import {
	BinahPublicApiManifest,
	createPublicApiValue
} from "/libs/awtsmoos-procedural-core/src/exports/api.js";
import { API_VERSION } from "../config.js";
import {
	PERUTA_OBSTACLE_FAMILIES,
	PERUTA_OBSTACLE_LAWS,
	perutaObstacleVariantIds
} from "../game/ObstacleVocabulary.js";
import { qualityProfileNames } from "../realism/QualityProfile.js";
import { PERUTA_RUN_EVENTS } from "./PerutaRunEventBus.js";

const PERUTA_COMMANDS = {
	left: {intent: "left", requiredStatus: "running"},
	right: {intent: "right", requiredStatus: "running"},
	jump: {intent: "jump", requiredStatus: "running"},
	duck: {intent: "duck", requiredStatus: "running"},
	pause: {intent: "pause", requiredStatus: "running"},
	resume: {intent: "pause", requiredStatus: "paused"},
	restart: {intent: "restart"}
};

const PERUTA_READS = {
	state: {source: "state"},
	diagnostics: {source: "diagnostics"}
};

const PERUTA_ALIASES = {
	moveLeft: {channel: "command", target: "left"},
	moveRight: {channel: "command", target: "right"},
	jump: {channel: "command", target: "jump"},
	duck: {channel: "command", target: "duck"},
	pause: {channel: "command", target: "pause"},
	resume: {channel: "command", target: "resume"},
	restart: {channel: "command", target: "restart"},
	getState: {channel: "state"},
	getDiagnostics: {channel: "inspect", target: "diagnostics"}
};

const PERUTA_OBSTACLE_VARIANTS = Object.freeze(perutaObstacleVariantIds());

export const PERUTA_API_COVENANT = new BinahPublicApiManifest({
	version: API_VERSION,
	commands: PERUTA_COMMANDS,
	reads: PERUTA_READS,
	aliases: PERUTA_ALIASES,
	features: featureCovenant()
});

export const PERUTA_API_MANIFEST = PERUTA_API_COVENANT.snapshot();

/** @param {object} tiferesProfile Active quality profile. @returns {object} Immutable public capability evidence. */
export function createPerutaRunCapabilities(tiferesProfile) {
	return createPublicApiValue({
		commands: ["moveLeft", "moveRight", "jump", "duck", "pause", "resume", "restart"],
		events: PERUTA_RUN_EVENTS,
		qualityProfiles: qualityProfileNames(),
		activeQualityProfile: tiferesProfile.name,
		protocol: ["state", "command", "inspect", "on"],
		...featureCovenant()
	});
}

/** @private @returns {object} Shared stable feature vocabulary. */
function featureCovenant() {
	return {
		obstacleLaws: PERUTA_OBSTACLE_LAWS,
		obstacleFamilies: PERUTA_OBSTACLE_FAMILIES,
		obstacleVariants: PERUTA_OBSTACLE_VARIANTS,
		photographicRegistrySurfaces: true,
		advancedCoreOliveTrees: true,
		proceduralWorld: true,
		authoredCharacterModel: true
	};
}
