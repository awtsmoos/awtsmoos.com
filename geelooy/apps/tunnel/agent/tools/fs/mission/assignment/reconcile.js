//B"H
//Boruch Hashem
//Blessed be He

const Mission = require("../index.js");
const Work = require("../workRegistry.js");
const Discovery = require("./discovery.js");
const Paths = require("./paths.js");

const CLOSED = new Set(["completed", "verified", "cancelled", "abandoned", "stopped"]);

/**
 * @file Migrates old missions into the global dispatcher without inventing chat ownership.
 * @description
 * Every mission receives a canonical absolute root. Empty living missions may receive one
 * bounded discovery generation so the next agent can ask what remains and get a real answer.
 */
async function all(config, input = {}) {
	const missions = await Mission.all(config);
	const records = [];
	for (const mission of missions) {
		const anchors = Paths.ensure(config, mission, input);
		let discovered = 0;
		const closed = CLOSED.has(String(mission.status || "").toLowerCase());
		if (!closed && !Work.open(mission).length && input.discoverEmpty !== false) {
			discovered = Discovery.seed(mission, config, input).created.length;
		}
		await Mission.save(config, mission);
		records.push({
			missionId: mission.id,
			projectRoot: anchors.projectRoot,
			absolutePaths: anchors.absolutePaths,
			remainingCount: Work.open(mission).length,
			discovered
		});
	}
	return {
		ok: true,
		action: "missionDispatchReconcile",
		count: records.length,
		records
	};
}

module.exports = { CLOSED, all };
