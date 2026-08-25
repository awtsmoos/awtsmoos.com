// B"H
// Boruch Hashem
// Blessed is He

const Lock = require("../mission/lock/index.js");
const Takeover = require("../mission/takeover/index.js");

/**
 * @file Applies explicit mission takeover while preserving unfinished continuation testimony.
 * @description
 * The Awtsmoos lets one shliach inherit the exact flame another could not finish;
 * Awtsmoos.com refuses anonymous custody and returns predecessor, continuation, and
 * remaining work so a successor takes responsibility rather than merely changing a label.
 */
function takeoverClaim(config, payload = {}) {
	const lock = Lock.active(config);
	if (!lock) {
		return { ok: false, action: "missionTakeoverClaim", error: "no_active_lock" };
	}
	const owner = Takeover.identity(payload);
	if (!owner) {
		return {
			ok: false,
			action: "missionTakeoverClaim",
			error: "takeover_identity_required"
		};
	}
	const claimed = Takeover.claim(lock, owner);
	Lock.set(config, claimed);
	return takeoverReceipt(claimed);
}

function takeoverReceipt(lock) {
	return {
		ok: true,
		action: "missionTakeoverClaim",
		owner: lock.owner,
		previousOwner: lock.previousOwner || null,
		takeoverAt: lock.takeoverAt,
		takeoverCount: lock.takeoverCount,
		mustCallNext: lock.mustCallNext || null,
		continuation: lock.continuation || null,
		remainingWork: lock.remainingWork || null
	};
}

module.exports = {
	takeoverClaim,
	takeoverReceipt
};
