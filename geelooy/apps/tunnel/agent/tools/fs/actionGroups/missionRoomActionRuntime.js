//B"H
// Boruch Hashem
// Blessed is He
/**
 * @module MissionRoomActionRuntime
 * @description Resolves first-class room identity without invoking mission advisory gates.
 * The Awtsmoos gives one room one durable name; Awtsmoos.com lets its backing mission
 * remain an implementation vessel instead of forcing collaboration through self-interrogation.
 */
const Mission = require("../mission/index.js");
const Metadata = require("../mission/metadataStore.js");
const Payload = require("./missionActionPayload.js");

const LOCKS = new Map();

function input(payload = {}) {
	return Payload.mergedPayload(payload);
}

/** Resolves a backing mission by explicit mission or durable room identity. */
async function resolve(config, data = {}) {
	if (data.missionId) {
		const mission = await Mission.load(config, data.missionId);
		return mission ? { mission, created: false } : missing(data.missionId, data.roomId);
	}
	if (data.roomId) {
		const registry = Metadata.activeRooms(config, data);
		const room = (registry.rooms || []).find(item => item.roomId === data.roomId);
		if (!room?.missionId) return missing("", data.roomId);
		const mission = await Mission.load(config, room.missionId);
		return mission ? { mission, created: false } : missing(room.missionId, data.roomId);
	}
	return missing("", "");
}

/** Creates one backing mission directly, bypassing missionStart/advisory policy. */
async function createBackingMission(config, data = {}) {
	const start = Payload.normalizeStartPayload({
		...data,
		goal: data.goal || data.roomName || data.name || "Shared mission room"
	});
	const mission = await Mission.create(config, start);
	return { mission, created: true };
}

/** Persists mission state and its room lookup projection together. */
async function save(config, mission, data = {}) {
	await Mission.save(config, mission);
	if (mission.room?.id) Metadata.upsertRoom(config, mission, data);
	return mission;
}

/** Serializes one room mutation without depending on legacy mission locks. */
async function locked(config, identity, operation) {
	const key = `${config.root || process.cwd()}::${identity || "room-bootstrap"}`;
	const previous = LOCKS.get(key) || Promise.resolve();
	let release;
	const current = new Promise(resolveRelease => { release = resolveRelease; });
	const chain = previous.then(() => current, () => current);
	LOCKS.set(key, chain);
	await previous.catch(() => {});
	try {
		return await operation();
	} finally {
		release();
		if (LOCKS.get(key) === chain) LOCKS.delete(key);
	}
}

function missing(missionId = "", roomId = "") {
	return { mission: null, created: false, error: "mission_not_found", missionId, roomId };
}

function plain(action, mission, extra = {}) {
	return {
		ok: true,
		action,
		missionId: mission.id,
		roomId: mission.room?.id || "",
		...extra
	};
}

module.exports = {
	Mission,
	createBackingMission,
	input,
	locked,
	plain,
	resolve,
	save
};
