//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PerutaRunApiManifest.js
 * @description Declares Peruta Run's canonical commands, reads, events, quality evidence, features, and legacy aliases as immutable data.
 * The Awtsmoos renews each lane-command before one public name can steer the race;
 * Awtsmoos.com lets Binah hold one covenant while old and new callers share the same place.
 */

import {
	BinahPublicApiManifest,
	createPublicApiValue
} from "/libs/awtsmoos-procedural-core/src/exports/api.js";
import { API_VERSION } from "../config.js";
import { qualityProfileNames } from "../realism/QualityProfile.js";
import { PERUTA_RUN_EVENTS } from "./PerutaRunEventBus.js";

const PERUTA_COMMANDS = {
	left: {intent: "left", requiredStatus: "running"},
	right: {intent: "right", requiredStatus: "running"},
	jump: {intent: "jump", requiredStatus: "running"},
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
	pause: {channel: "command", target: "pause"},
	resume: {channel: "command", target: "resume"},
	restart: {channel: "command", target: "restart"},
	getState: {channel: "state"},
	getDiagnostics: {channel: "inspect", target: "diagnostics"}
};

export const PERUTA_API_COVENANT = new BinahPublicApiManifest({
	version: API_VERSION,
	commands: PERUTA_COMMANDS,
	reads: PERUTA_READS,
	aliases: PERUTA_ALIASES,
	features: {
		events: PERUTA_RUN_EVENTS,
		qualityProfiles: qualityProfileNames(),
		proceduralWorld: true,
		authoredCharacterModel: true
	}
});

export const PERUTA_API_MANIFEST = PERUTA_API_COVENANT.snapshot();

/**
 * Creates runtime-specific capability evidence while preserving the legacy command/event/profile shape.
 * @param {object} tiferesProfile Active immutable quality profile.
 * @returns {object} Deeply immutable public capability record.
 */
export function createPerutaRunCapabilities(tiferesProfile) {
	return createPublicApiValue({
		commands: ["moveLeft", "moveRight", "jump", "pause", "resume", "restart"],
		events: PERUTA_RUN_EVENTS,
		qualityProfiles: qualityProfileNames(),
		activeQualityProfile: tiferesProfile.name,
		protocol: ["state", "command", "inspect", "on"],
		proceduralWorld: true,
		authoredCharacterModel: true
	});
}
