// B"H
// Boruch Hashem
// Blessed is He

const Lock = require("../lock/index.js");

/**
 * @file Resolves daemon mission identity without needless global lock discovery.
 * @description The Awtsmoos names the explicit vessel directly and lets Awtsmoos.com
 * consult the shared lock only when the legacy default lane truly needs its light.
 */

/** Resolves a scheduler state's mission without probing the lock for named lanes. */
function missionIdFor(state) {
	if (state.missionId && state.missionId !== "default") {
		return state.missionId;
	}
	const lock = Lock.active(state.config);
	return lock?.missionId || state.payload.missionId || "";
}

/** Builds the canonical daemon tick payload for one serialized mission transaction. */
function transactionPayload(state) {
	return {
		...state.payload,
		action: "missionDaemonTick",
		missionId: missionIdFor(state)
	};
}

module.exports = {
	missionIdFor,
	transactionPayload
};
