//B"H
// Boruch Hashem
// Blessed is He

const SessionStore = require("../agentSessionStore.js");
const Mission = require("../index.js");
const Lock = require("../lock/index.js");
const State = require("./state.js");
const Debt = require("./completionDebt.js");
const Capsule = require("./continuationCapsule.js");
const Shared = require("./sharedShliachTransport.js");

/**
 * @file Projects continuation debt, slots, sessions, and shared-browser identity for operators.
 * @description The Awtsmoos hides no custody behind automation; Awtsmoos.com exposes why each
 * successor exists, whether it joined, what remains unfinished, and which singular browser serves it.
 */
async function context(config, payload = {}) {
	const lock = payload.lock || Lock.active(config);
	if (!lock?.missionId) return { lock: null, mission: null, debt: null };
	const mission = payload.mission || await Mission.load(config, lock.missionId);
	if (!mission?.id) return { lock, mission: null, debt: null };
	const logicalAgentId = String(payload.logicalAgentId || lock.logicalAgentId || "");
	const debt = await Debt.assess(
		config,
		mission,
		lock,
		{ logicalAgentId },
		{ Mission }
	);
	return { lock, mission, debt, logicalAgentId };
}

function compactSlot(record = {}) {
	return {
		fingerprint: record.fingerprint,
		poolSlot: Number(record.poolSlot || 0),
		poolRole: record.poolRole || "",
		status: record.status || "",
		attempts: Number(record.attempts || 0),
		acceptedAt: record.acceptedAt || "",
		joinedAt: record.joinedAt || "",
		joinedSessionId: record.joinedSessionId || "",
		lastError: record.lastError || "",
		capsuleHash: record.capsuleHash || "",
		successorAgentId: record.successorAgentId || record.logicalAgentId || "",
		successorAgentSessionId: record.successorAgentSessionId || record.agentSessionId || ""
	};
}

async function status(config, payload = {}) {
	const current = await context(config, payload);
	if (!current.mission) {
		return { ok: true, active: false, missionId: current.lock?.missionId || "", slots: [] };
	}
	const sessions = await SessionStore.all(config);
	const slots = State.list(config, current.mission.id).map(compactSlot);
	let sharedBrowser = null;
	try {
		const browser = await Shared.registry(payload.registryFile);
		sharedBrowser = { port: browser.port, profile: browser.profile };
	} catch (error) {
		sharedBrowser = { error: error?.message || String(error) };
	}
	return {
		ok: true,
		active: true,
		missionId: current.mission.id,
		status: current.mission.status || "",
		debt: current.debt,
		slots,
		sessions: sessions.filter(session => {
			return session.activeMissionId === current.mission.id
				|| slots.some(slot => slot.successorAgentSessionId === session.id);
		}),
		sharedBrowser
	};
}

async function capsule(config, payload = {}) {
	const current = await context(config, payload);
	if (!current.mission) return { ok: false, error: "active_mission_missing" };
	const result = await Capsule.build(config, current.mission, current.debt, {
		logicalAgentId: current.logicalAgentId
	});
	return { ok: true, missionId: current.mission.id, debt: current.debt, capsule: result };
}

module.exports = { capsule, compactSlot, context, status };
