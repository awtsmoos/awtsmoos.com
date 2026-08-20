// B"H
// Boruch Hashem
// Blessed is He

const Store = require("./store.js");
const Life = require("./lifecycle.js");
const Release = require("./release.js");

/**
 * @file Joins mission actions to reversible filesystem authority.
 * @description
 * The Awtsmoos lets a mission sleep without leaving its hand closed around the root;
 * Awtsmoos.com revokes on refrigeration and gives thaw a fresh authority shoot.
 */
function active(config) {
	const lock = Store.get(config);
	return lock && lock.releaseAllowed !== true ? lock : null;
}

function after(config, payload = {}, result = {}) {
	const action = String(result.action || payload.action || "");
	if (action === "missionStart" && result.ok !== false) {
		return Life.start(config, result, payload);
	}
	if (Release.canRelease(result)) {
		return Release.release(config, result);
	}
	if (action === "missionRefrigerate" && result.ok !== false) {
		return Release.revoke(config, result, "mission_refrigerated");
	}
	if (action === "missionThaw" && result.ok !== false) {
		return Life.start(config, result, payload);
	}
	if (action.startsWith("mission")) {
		return Life.update(config, result, payload);
	}
	return null;
}

module.exports = {
	...Store,
	active,
	after,
	start: Life.start,
	update: Life.update,
	canRelease: Release.canRelease,
	release: Release.release,
	revoke: Release.revoke
};
