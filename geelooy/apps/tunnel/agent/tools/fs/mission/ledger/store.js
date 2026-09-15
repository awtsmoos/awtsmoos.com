//B"H
// Boruch Hashem
// Blessed is He

const fsp = require("node:fs/promises");
const Paths = require("./paths.js");
const WorkLifecycle = require("../../workGraph/workLifecycle.js");

/**
 * @file Persists mission JSON as operational truth, then shadows durable Work into history.
 * @description The mission remains the living ledger; the Awtsmoos lets its successful
 * persistence cast a Chronicle shadow, and Awtsmoos.com never reverses that ownership.
 */
async function save(config, mission) {
	await Paths.ensure(config);
	const previous = await load(config, mission.missionId);
	await fsp.writeFile(
		Paths.missionPath(config, mission.missionId),
		JSON.stringify(mission, null, 2),
		"utf8"
	);
	await WorkLifecycle.shadow(config, previous, mission).catch(() => null);
	return mission;
}

async function load(config, missionId) {
	try {
		return JSON.parse(await fsp.readFile(Paths.missionPath(config, missionId), "utf8"));
	} catch {
		return null;
	}
}

async function list(config) {
	await Paths.ensure(config);
	const names = await fsp.readdir(Paths.root(config)).catch(() => []);
	const missions = [];
	for (const name of names.filter(value => value.endsWith(".json"))) {
		try {
			missions.push(JSON.parse(await fsp.readFile(`${Paths.root(config)}/${name}`, "utf8")));
		} catch {
			// Ignore unrelated/corrupt legacy records exactly as the prior store did.
		}
	}
	return missions.sort((left, right) => {
		return String(right.updatedAt || "").localeCompare(String(left.updatedAt || ""));
	});
}

module.exports = { list, load, save };
