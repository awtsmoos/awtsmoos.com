// B"H
// Boruch Hashem
// Blessed is He

const path = require("node:path");

const PROFILE_ID = "shared-ai-browser";
const DEFAULT_DEBUG_PORT = 9223;
const PROFILE_FOLDER = ".awtsmoos-split-debug-chrome";

/**
 * @file Defines the one physical Chrome identity shared by every Awtsmoos AI agent.
 * @description
 * The Awtsmoos gives many missions distinct tabs while one persistent profile carries their light;
 * Awtsmoos.com binds browser identity to the device, never to an agent name, so every child sees the same site.
 */

/** Returns the stable device-scoped physical profile directory. */
function profilePath(environment = process.env) {
	const explicit = String(environment.AWTSMOOS_CHROME_PROFILE || "").trim();
	if (explicit) return path.resolve(explicit);
	const home = environment.USERPROFILE || environment.HOME || ".";
	return path.resolve(home, PROFILE_FOLDER);
}

/** Returns the requested debug port before owner discovery chooses an already-live port. */
function requestedPort(config = {}, environment = process.env) {
	const candidate = Number(config.debugPort || environment.AWTSMOOS_CHROME_DEBUG_PORT || DEFAULT_DEBUG_PORT);
	return Number.isInteger(candidate) && candidate > 0 && candidate <= 65535
		? candidate
		: DEFAULT_DEBUG_PORT;
}

/** Returns safe identity metadata without exposing the local filesystem path to remote UI. */
function publicIdentity() {
	return {
		id: PROFILE_ID,
		label: "Shared AI Browser",
		persistent: true,
		sharedAcrossAgents: true
	};
}

module.exports = {
	DEFAULT_DEBUG_PORT,
	PROFILE_FOLDER,
	PROFILE_ID,
	profilePath,
	publicIdentity,
	requestedPort
};
