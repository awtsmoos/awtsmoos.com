//B"H
//Boruch Hashem
//Blessed be He

const path = require("node:path");

const PROFILE_ID = "shared-ai-browser";
const DEFAULT_DEBUG_PORT = 0;
const PROFILE_FOLDER = ".awtsmoos-split-debug-chrome";
const MAX_BROWSER_ROOTS = 1;
const MAX_IDLE_PAGES = 1;
const MAX_AGENT_TABS = 1;
const MAX_ACTIVE_PAGES = MAX_IDLE_PAGES + MAX_AGENT_TABS;

/**
 * @file Defines the single physical browser vessel shared by every AI agent.
 * @description
 * Many logical Shluchim may exist, but browser reality stays deliberately tiny:
 * one persistent device profile, one Chrome root process, one idle Shliach page,
 * and at most one temporary agent page while a physical turn is in progress.
 */
function profilePath(environment = process.env) {
	const explicit = String(environment.AWTSMOOS_CHROME_PROFILE || "").trim();
	if (explicit) return path.resolve(explicit);
	const home = environment.USERPROFILE || environment.HOME || ".";
	return path.resolve(home, PROFILE_FOLDER);
}

/** Returns an explicit device port, or zero for a collision-free dynamic port. */
function requestedPort(config = {}, environment = process.env) {
	const candidate = Number(
		config.debugPort ||
		environment.AWTSMOOS_CHROME_DEBUG_PORT ||
		DEFAULT_DEBUG_PORT
	);
	return Number.isInteger(candidate) && candidate >= 0 && candidate <= 65535
		? candidate
		: DEFAULT_DEBUG_PORT;
}

/** Returns immutable browser-capacity law for status, cleanup, and admission. */
function capacity() {
	return {
		maxBrowserRoots: MAX_BROWSER_ROOTS,
		maxIdlePages: MAX_IDLE_PAGES,
		maxAgentTabs: MAX_AGENT_TABS,
		maxActivePages: MAX_ACTIVE_PAGES
	};
}

/** Returns safe identity metadata without exposing the local profile path. */
function publicIdentity() {
	return {
		id: PROFILE_ID,
		label: "Shared AI Browser",
		persistent: true,
		sharedAcrossAgents: true,
		...capacity()
	};
}

module.exports = {
	DEFAULT_DEBUG_PORT,
	MAX_ACTIVE_PAGES,
	MAX_AGENT_TABS,
	MAX_BROWSER_ROOTS,
	MAX_IDLE_PAGES,
	PROFILE_FOLDER,
	PROFILE_ID,
	capacity,
	profilePath,
	publicIdentity,
	requestedPort
};
