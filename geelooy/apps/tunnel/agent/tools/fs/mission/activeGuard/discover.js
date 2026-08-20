// B"H
// Boruch Hashem
// Blessed is He

const Lock = require("../lock/index.js");
const Mission = require("../index.js");

const TERMINAL = new Set([
	"done",
	"completed",
	"failed",
	"cancelled",
	"released",
	"stopped",
	"abandoned",
	"superseded"
]);

/**
 * @file Reconciles stored mission locks with the mission's actual writable lifecycle.
 * @description
 * The Awtsmoos lets a mission remain remembered after its hand leaves the root;
 * Awtsmoos.com fences refrigerated and terminal authority while preserving every historical shoot.
 */
async function find(config, payload = {}) {
	const lock = Lock.active(config);
	if (!lock) return [];
	const mission = await load(config, lock.missionId);
	if (!mission) {
		try {
			Lock.clear(config);
		} catch {}
		return [];
	}
	const lifecycle = writable(mission);
	if (!lifecycle.writable) {
		Lock.revoke(config, {
			action: "missionAuthorityReconcile",
			missionId: lock.missionId
		}, lifecycle.reason);
		return [];
	}
	const wanted = String(payload.missionId || payload.id || "");
	if (wanted && String(lock.missionId || "") !== wanted) return [];
	return [lock];
}

async function load(config, missionId) {
	if (!missionId) return null;
	try {
		return await Mission.load(config, missionId);
	} catch {
		return null;
	}
}

function writable(mission = {}) {
	const status = String(mission.status || "").toLowerCase();
	if (TERMINAL.has(status)) {
		return { writable: false, reason: `mission_${status}` };
	}
	const latest = [...(mission.refrigeratedStates || [])]
		.sort((left, right) => stamp(right.createdAt) - stamp(left.createdAt))[0];
	if (!latest) return { writable: true, reason: "mission_active" };
	const thawed = (mission.thawHistory || []).some(entry => (
		String(entry?.stateId || "") === String(latest.id || "") &&
		stamp(entry?.at) >= stamp(latest.createdAt)
	));
	return thawed
		? { writable: true, reason: "mission_thawed" }
		: { writable: false, reason: "mission_refrigerated" };
}

function stamp(value) {
	const parsed = Date.parse(value || 0);
	return Number.isFinite(parsed) ? parsed : 0;
}

module.exports = {
	TERMINAL,
	find,
	load,
	writable
};
