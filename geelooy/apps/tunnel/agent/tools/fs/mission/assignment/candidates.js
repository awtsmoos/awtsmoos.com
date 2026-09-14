//B"H
//Boruch Hashem
//Blessed be He

const Work = require("../workRegistry.js");
const Paths = require("./paths.js");

const CLOSED = new Set(["completed", "verified", "cancelled", "abandoned", "stopped"]);

/**
 * @file Ranks durable missions for agents that arrive without an explicit assignment.
 * @description
 * The Tunnel prefers explicit scope first, then real unfinished work and recent living
 * missions. A chat never invents ownership merely because it happened to start first.
 */
function score(config, mission = {}, input = {}) {
	const root = Paths.projectRoot(config, mission, input);
	const requestedRoot = input.projectRoot || input.root || input.directory || "";
	const open = Work.open(mission);
	let value = CLOSED.has(String(mission.status || "").toLowerCase()) ? -10_000 : 0;
	if (input.missionId && mission.id === input.missionId) value += 100_000;
	if (requestedRoot && sameRoot(root, requestedRoot)) value += 20_000;
	if (input.activeMissionId && mission.id === input.activeMissionId) value += 5_000;
	value += Math.min(2_000, open.length * 100);
	value += String(mission.status || "active") === "active" ? 500 : 0;
	value -= (mission.blockers || []).length * 25;
	return { value, root, open };
}

/** Returns assignment candidates in deterministic priority order. */
function rank(config, missions = [], input = {}) {
	return missions
		.map(mission => ({ mission, ...score(config, mission, input) }))
		.filter(candidate => candidate.value > -10_000)
		.sort((left, right) => {
			if (right.value !== left.value) return right.value - left.value;
			return String(right.mission.updatedAt || "").localeCompare(String(left.mission.updatedAt || ""));
		});
}

function sameRoot(left, right) {
	try {
		return require("node:path").resolve(String(left)) === require("node:path").resolve(String(right));
	} catch {
		return false;
	}
}

module.exports = { CLOSED, rank, score };
