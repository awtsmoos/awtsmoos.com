//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file TempleApiManifest.js
 * @description Declares Temple Runner's canonical command, configuration, read, feature, and compatibility covenant as immutable data.
 * The Awtsmoos renews every public word before one alias may borrow its ray;
 * Awtsmoos.com lets Binah describe one canonical river while familiar names still find their way.
 */

import {
	BinahPublicApiManifest,
	createPublicApiValue
} from "/libs/awtsmoos-procedural-core/src/exports/api.js";

const TEMPLE_COMMANDS = {
	left: {family: "input", intent: "left"},
	right: {family: "input", intent: "right"},
	jump: {family: "input", intent: "jump"},
	slide: {family: "input", intent: "duck"},
	pause: {family: "input", intent: "pause", requiredStatus: "running"},
	resume: {family: "input", intent: "pause", requiredStatus: "paused"},
	restart: {family: "input", intent: "restart"},
	"input.request": {family: "inputPayload"},
	"details.open": {family: "details", action: "open"},
	"details.close": {family: "details", action: "close"}
};

const TEMPLE_CONFIGURATION = {
	fx: {type: "boolean"},
	reducedMotion: {type: "boolean"},
	controls: {type: "boolean"}
};

const TEMPLE_READS = {
	state: {source: "state"},
	diagnostics: {source: "diagnostics"},
	preferences: {source: "preferences"}
};

const TEMPLE_ALIASES = {
	left: {channel: "command", target: "left"},
	right: {channel: "command", target: "right"},
	jump: {channel: "command", target: "jump"},
	slide: {channel: "command", target: "slide"},
	pause: {channel: "command", target: "pause"},
	resume: {channel: "command", target: "resume"},
	restart: {channel: "command", target: "restart"},
	request: {channel: "command", target: "input.request", argument: "first"},
	setFx: {channel: "configure", target: "fx"},
	setReducedMotion: {channel: "configure", target: "reducedMotion"},
	setControlsVisible: {channel: "configure", target: "controls"},
	getState: {channel: "state"},
	getDiagnostics: {channel: "inspect", target: "diagnostics"},
	getPreferences: {channel: "inspect", target: "preferences"},
	describe: {channel: "inspect", target: "manifest"},
	openDetails: {channel: "command", target: "details.open"},
	closeDetails: {channel: "command", target: "details.close"}
};

export const TEMPLE_API_COVENANT = new BinahPublicApiManifest({
	version: "3.0.0",
	commands: TEMPLE_COMMANDS,
	configuration: TEMPLE_CONFIGURATION,
	reads: TEMPLE_READS,
	aliases: TEMPLE_ALIASES,
	features: {
		advancedDrawer: true,
		ambientPointClouds: true,
		proceduralCoreOnly: true
	}
});

export const TEMPLE_API_MANIFEST = TEMPLE_API_COVENANT.snapshot();

export const TEMPLE_API_CAPABILITIES = createPublicApiValue({
	commands: ["left", "right", "jump", "slide", "pause", "resume", "restart"],
	preferences: ["fx", "reducedMotion", "controls"],
	protocol: ["state", "command", "configure", "inspect"],
	...TEMPLE_API_MANIFEST.features
});
