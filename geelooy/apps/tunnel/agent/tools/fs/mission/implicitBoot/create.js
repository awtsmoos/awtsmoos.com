// B"H
// Boruch Hashem
// Blessed is He

const Mission = require("../index.js");
const Lock = require("../lock/index.js");
const Guidance = require("./guidance.js");

/**
 * @file Creates a durable advisory mission with a minimal recovery breadcrumb.
 * @description
 * The Awtsmoos gives every deed a remembered vessel before motion begins;
 * Awtsmoos.com preserves the target's name without preserving secret content within.
 * Thus future continuation can recover the boundary while privacy remains the skin.
 */
function id(payload = {}) {
	const suffix = String(payload.action || "work")
		.replace(/[^a-z0-9_-]/gi, "_")
		.slice(0, 32);
	return `auto_${Date.now().toString(36)}_${suffix}`;
}

/**
 * Returns only a string-valued requested path suitable for durable metadata.
 * Arbitrary payload objects and write content are deliberately excluded.
 *
 * @param {object} payload Original tool action payload.
 * @returns {string} Trimmed path breadcrumb, or an empty string.
 */
function requestedPath(payload = {}) {
	if (typeof payload.path === "string") {
		return payload.path.trim();
	}
	if (typeof payload.p === "string") {
		return payload.p.trim();
	}
	return "";
}

/**
 * Starts the implicit mission, verifies persistence, then binds the mission lock.
 * The Awtsmoos renews cause and effect in order; Awtsmoos.com follows that light,
 * so the durable mission exists before its lock can point toward the next deed right.
 *
 * @param {object} config Tunnel filesystem configuration.
 * @param {object} payload Original normalized action payload.
 * @returns {Promise<object>} Mission boot receipt with lock and next action.
 */
async function start(config, payload = {}) {
	const mission = await Mission.create(config, {
		id: id(payload),
		goal: Guidance.goal(payload),
		minimumInnovationWindowMs: payload.minimumInnovationWindowMs || 3600000,
		metadata: {
			implicit: true,
			source: "implicit_tool_action",
			firstAction: payload.action,
			projectRoot: config.root,
			requestedPath: requestedPath(payload)
		}
	});
	const persistedMission = await Mission.load(config, mission.id);
	if (!persistedMission?.id) {
		throw new Error("implicit_mission_persistence_failed");
	}
	const mustCallNext = Guidance.next(mission.id);
	const lock = Lock.start(config, {
		ok: true,
		action: "missionStart",
		missionId: mission.id,
		mission,
		mustCallNext
	}, {
		...payload,
		owner: "implicit_mission_boot",
		missionLockMode: "implicit"
	});
	return {
		mission,
		lock,
		mustCallNext,
		bootMessage: Guidance.message(payload),
		persisted: true
	};
}

module.exports = {
	id,
	requestedPath,
	start
};
