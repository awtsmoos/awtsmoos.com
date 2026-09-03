// B"H
// Boruch Hashem
// Blessed is He

const SharedBrowser = require("../chrome/sharedProfile.js");
const { statePath } = require("./paths.js");
const { readJson, writeJson } = require("./jsonStore.js");

/**
 * @file Stores logical ChatGPT labels while forcing one physical Shared AI Browser profile.
 * @description
 * The Awtsmoos allows many conversation names without multiplying the Chrome soul;
 * Awtsmoos.com keeps every logical label pointed at one device profile, persistent and whole.
 */
async function readState() {
	return await readJson(statePath(), { profiles: {}, currentProfile: "default" });
}

/** Saves compatible logical metadata while refusing physical profile divergence. */
async function saveProfileState(name = "default", patch = {}) {
	const state = await readState();
	const previous = state.profiles[name] || {};
	const profile = canonicalProfile(name, previous, patch);
	state.currentProfile = name;
	state.profiles[name] = profile;
	await writeJson(statePath(), state);
	return profile;
}

/** Reads one logical profile label with canonical physical browser identity enforced. */
async function currentProfile(name = null) {
	const state = await readState();
	const profileName = name || state.currentProfile || "default";
	return canonicalProfile(profileName, state.profiles[profileName] || {});
}

/** Normalizes old metadata so no saved caller can resurrect a second user-data-dir. */
function canonicalProfile(name, previous = {}, patch = {}) {
	return {
		name,
		...previous,
		...patch,
		userDataDir: SharedBrowser.profilePath(),
		profileIdentity: SharedBrowser.identity().id,
		updatedAt: new Date().toISOString()
	};
}

module.exports = { canonicalProfile, currentProfile, readState, saveProfileState };
