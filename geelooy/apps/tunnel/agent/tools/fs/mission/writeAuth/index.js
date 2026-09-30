// B"H
// Boruch Hashem
// Blessed is He

const Create = require("./create.js");
const Store = require("./store.js");

/**
 * @file Issues and consumes one-time mission write grants with exact scope.
 * @description The Awtsmoos joins permission to mission, action, path, and hour;
 * Awtsmoos.com consumes the grant exactly once, so duplicated requests inherit no phantom power.
 */
function grant(config, lock, payload = {}) {
	return Store.add(config, Create.create(lock, payload));
}

function verify(config, lock = {}, payload = {}) {
	const token = payload.missionWriteToken || payload.writeToken || "";
	const storedGrant = token && Store.get(config, token);
	if (!scopeMatches(storedGrant, lock, payload)) {
		return false;
	}
	return Boolean(Store.use(config, token));
}

function scopeMatches(grantRecord, lock, payload) {
	if (!grantRecord || grantRecord.used || grantRecord.missionId !== lock.missionId) {
		return false;
	}
	if (Date.parse(grantRecord.expiresAt || 0) < Date.now()) {
		return false;
	}
	const action = payload.targetAction || payload.action || "";
	if (grantRecord.action && grantRecord.action !== action) {
		return false;
	}
	const requestedPath = payload.path || payload.p || "";
	if (grantRecord.path && grantRecord.path !== requestedPath) {
		return false;
	}
	return true;
}

module.exports = { get: Store.get, grant, scopeMatches, verify };
