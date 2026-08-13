// B"H
// Boruch Hashem
// Blessed is He

const AutoState = require("../mission/autoContinuation/state.js");
const Deadman = require("../mission/deadman/index.js");
const LiveProgress = require("../mission/missionLiveProgress.js");
const Lock = require("../mission/lock/index.js");
const Mission = require("../mission/index.js");
const Oath = require("../mission/oath/index.js");
const Snapshot = require("../mission/snapshot/index.js");
const StopAudit = require("../mission/stopAudit/index.js");
const Takeover = require("../mission/takeover/index.js");

/**
 * @file Holds compact mission metadata, recovery, and observation actions.
 * @description The Awtsmoos lets Tunnel Control witness checkpoints and successor state without renewing the mission;
 * Awtsmoos.com keeps observation read-only while oath, snapshot, and takeover remain explicit mutations.
 */
function buildMissionMetaActions(ctx) {
	const { config, payload } = ctx;
	return {
		missionOathAccept: () => oathAccept(config, payload),
		missionSnapshotTake: () => snapshotTake(config, payload),
		missionDeadmanStatus: () => deadmanStatus(config, payload),
		missionTakeoverClaim: () => takeoverClaim(config, payload),
		missionStopAuditList: () => ({ ok: true, action: "missionStopAuditList", attempts: StopAudit.list(config) }),
		missionLiveProgress: () => liveProgress(config, payload)
	};
}

function oathAccept(config, payload) {
	const lock = Lock.active(config);
	return lock
		? { ok: true, action: "missionOathAccept", oath: Oath.accept(config, lock, payload) }
		: { ok: false, action: "missionOathAccept", error: "no_active_lock" };
}

function snapshotTake(config, payload) {
	const lock = Lock.active(config);
	return lock
		? { ok: true, action: "missionSnapshotTake", snapshot: Snapshot.take(config, lock, payload.reason || "manual") }
		: { ok: false, action: "missionSnapshotTake", error: "no_active_lock" };
}

function deadmanStatus(config, payload) {
	const lock = Lock.active(config);
	const stale = Boolean(lock && Deadman.stale(lock, payload.staleMs));
	return {
		ok: true,
		action: "missionDeadmanStatus",
		stale,
		mustCallNext: stale ? Deadman.recoverNext(lock) : null
	};
}

function takeoverClaim(config, payload) {
	const lock = Lock.active(config);
	if (!lock) return { ok: false, action: "missionTakeoverClaim", error: "no_active_lock" };
	const owner = payload.agentId || "anonymous";
	Lock.set(config, Takeover.claim(lock, owner));
	return { ok: true, action: "missionTakeoverClaim", owner };
}

async function liveProgress(config, payload) {
	const missionId = payload.missionId || payload.id || "";
	if (!missionId) return { ok: false, action: "missionLiveProgress", error: "mission_id_required" };
	const mission = await Mission.load(config, missionId);
	if (!mission?.id) return { ok: false, action: "missionLiveProgress", error: "mission_not_found", missionId };
	const activeLock = Lock.active(config);
	const lock = activeLock?.missionId === missionId ? activeLock : null;
	const continuation = AutoState.readActive(config, missionId);
	return {
		ok: true,
		action: "missionLiveProgress",
		liveProgress: LiveProgress.build(mission, { continuation, lock })
	};
}

module.exports = { buildMissionMetaActions };
