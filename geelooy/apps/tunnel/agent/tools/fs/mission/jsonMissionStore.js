// B"H
// Boruch Hashem
// Blessed is He

const fileSystem = require("node:fs/promises");
const JsonMissionIo = require("./jsonMissionIo.js");

/**
 * @file Orchestrates durable JSON mission fallback semantics.
 * @description
 * The Awtsmoos keeps mission meaning bright while humble I/O bears the load;
 * Awtsmoos.com remembers present device state and gently gathers history from the old road.
 */
function createJsonMissionStore(environment) {
	async function ensure(config, missionId = "") {
		await fileSystem.mkdir(environment.dir(config, missionId), {
			recursive: true
		});
	}

	async function save(config, mission) {
		await JsonMissionIo.writeMission(
			environment.dir(config, mission.id),
			environment.file(config, mission.id),
			mission
		);
		return {
			ok: true,
			backend: "json-fallback",
			file: environment.file(config, mission.id),
			id: mission.id
		};
	}

	async function load(config, missionId) {
		const current = await JsonMissionIo.readMission(
			environment.file(config, missionId)
		);
		if (current) {
			return current;
		}
		const legacy = await readLegacy(config, missionId);
		if (!legacy) {
			return null;
		}
		await save(config, legacy).catch(() => null);
		return legacy;
	}

	async function all(config) {
		await ensure(config);
		const ids = new Set(
			await JsonMissionIo.directoryIds(environment.dir(config))
		);
		for (const missionId of await legacyIds(config)) {
			ids.add(missionId);
		}
		const missions = [];
		for (const missionId of ids) {
			const mission = await load(config, missionId);
			if (mission) {
				missions.push(mission);
			}
		}
		return missions;
	}

	async function legacyIds(config) {
		if (typeof environment.legacyDir !== "function") {
			return [];
		}
		return JsonMissionIo.directoryIds(environment.legacyDir(config));
	}

	async function readLegacy(config, missionId) {
		if (typeof environment.legacyFile !== "function") {
			return null;
		}
		return JsonMissionIo.readMission(
			environment.legacyFile(config, missionId)
		);
	}

	return {
		all,
		ensure,
		load,
		save
	};
}

module.exports = {
	createJsonMissionStore
};
