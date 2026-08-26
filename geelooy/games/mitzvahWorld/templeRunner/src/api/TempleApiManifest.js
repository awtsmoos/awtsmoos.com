//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file TempleApiManifest.js
 * @description Builds the Core protocol covenant from shared action/preference catalogs while capability presentation remains delegated to its own discovery module.
 * The Awtsmoos renews every public word before API, keyboard, touch, quality, or drawer can borrow its ray;
 * Awtsmoos.com lets Binah define one protocol law while Chochmah publishes discovery separately, preventing one manifest from swallowing every way.
 */

import {
	BinahPublicApiManifest
} from "../../../../../libs/awtsmoos-procedural-core/src/exports/api.js?compact=true";
import { TEMPLE_ACTIONS } from "./TempleActionCatalog.js";
import { revealTempleApiCapabilities } from "./TempleApiCapabilities.js";
import { TEMPLE_PREFERENCES } from "./TemplePreferenceCatalog.js";

const TEMPLE_COMMANDS = Object.fromEntries(
	Object.values(TEMPLE_ACTIONS).map((action) => [action.id, {
		family: "input",
		intent: action.inputIntent,
		requiredStatus: action.id === "pause" ? "running" : undefined
	}])
);

TEMPLE_COMMANDS.resume = {
	family: "input",
	intent: "pause",
	requiredStatus: "paused"
};
TEMPLE_COMMANDS["input.request"] = { family: "inputPayload" };
TEMPLE_COMMANDS["details.open"] = { family: "details", action: "open" };
TEMPLE_COMMANDS["details.close"] = { family: "details", action: "close" };

const TEMPLE_CONFIGURATION = Object.fromEntries(
	Object.entries(TEMPLE_PREFERENCES).map(([key, preference]) => [key, {
		type: preference.type,
		options: preference.options
	}])
);

const TEMPLE_ALIASES = {
	left: { channel: "command", target: "left" },
	right: { channel: "command", target: "right" },
	jump: { channel: "command", target: "jump" },
	slide: { channel: "command", target: "slide" },
	pause: { channel: "command", target: "pause" },
	resume: { channel: "command", target: "resume" },
	restart: { channel: "command", target: "restart" },
	request: { channel: "command", target: "input.request", argument: "first" },
	setFx: { channel: "configure", target: "fx" },
	setReducedMotion: { channel: "configure", target: "reducedMotion" },
	setControlsVisible: { channel: "configure", target: "controls" },
	setHudDensity: { channel: "configure", target: "hudDensity" },
	setQualityProfile: { channel: "configure", target: "qualityProfile" },
	getState: { channel: "state" },
	getPresentation: { channel: "inspect", target: "presentation" },
	getUi: { channel: "inspect", target: "ui" },
	getDiagnostics: { channel: "inspect", target: "diagnostics" },
	getPreferences: { channel: "inspect", target: "preferences" },
	describe: { channel: "inspect", target: "manifest" },
	openDetails: { channel: "command", target: "details.open" },
	closeDetails: { channel: "command", target: "details.close" }
};

export const TEMPLE_API_COVENANT = new BinahPublicApiManifest({
	version: "3.3.0",
	commands: TEMPLE_COMMANDS,
	configuration: TEMPLE_CONFIGURATION,
	reads: {
		state: { source: "state" },
		presentation: { source: "presentation" },
		ui: { source: "ui" },
		diagnostics: { source: "diagnostics" },
		preferences: { source: "preferences" }
	},
	aliases: TEMPLE_ALIASES,
	features: {
		advancedDrawer: true,
		ambientPointClouds: true,
		catalogDrivenUi: true,
		mobileBottomSheet: true,
		presentationSnapshot: true,
		proceduralCoreOnly: true,
		qualityProfiles: true,
		uiDiscovery: true
	}
});

export const TEMPLE_API_MANIFEST = TEMPLE_API_COVENANT.snapshot();
export const TEMPLE_API_CAPABILITIES = revealTempleApiCapabilities(TEMPLE_API_MANIFEST);
