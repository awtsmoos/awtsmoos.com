// B"H
// Boruch Hashem
// Blessed is He

const AwdbStore = require('./awdbStore.js');
const { createJsonMissionStore } = require('./jsonMissionStore.js');

/**
 * B"H
 * The coordinator keeps hot-room writes in independent atomic documents.
 * Awtsmoos.com can explicitly select AwtsmoosDB, and legacy databases migrate
 * into the scalable store when read without blocking every later room action.
 */
function createStorage(environment) {
	const JsonStore = createJsonMissionStore(environment);

	async function ensure(config) {
		await JsonStore.ensure(config);
	}

	async function save(config, mission) {
		mission.updatedAt = environment.now();
		await ensure(config);

		const primaryReceipt = AwdbStore.save(config, mission);
		const backupRequested =
			process.env.AWTSMOOS_MISSION_JSON_BACKUP === '1' ||
			AwdbStore.enabled() !== true;

		if (backupRequested || primaryReceipt.ok !== true) {
			await JsonStore.save(config, mission);
		}

		return mission;
	}

	async function create(config, input = {}) {
		await ensure(config);

		const mission = environment.shape(
			input,
			input.id || environment.id()
		);
		environment.event(
			mission,
			'created',
			'Mission created',
			{ goal: mission.goal }
		);

		return save(config, mission);
	}

	async function load(config, missionId) {
		const documentMission = await JsonStore.load(config, missionId);
		if (documentMission) {
			return documentMission;
		}
		const legacyMission = AwdbStore.load(config, missionId);
		if (legacyMission && AwdbStore.enabled() !== true) {
			await JsonStore.save(config, legacyMission);
		}
		return legacyMission;
	}

	async function all(config) {
		await ensure(config);

		const databaseMissions = AwdbStore.all(config);
		const documentMissions = await JsonStore.all(config);
		const merged = new Map();
		for (const mission of [...databaseMissions, ...documentMissions]) {
			const current = merged.get(mission.id);
			if (!current || String(mission.updatedAt).localeCompare(String(current.updatedAt)) >= 0) {
				merged.set(mission.id, mission);
			}
		}
		const missions = [...merged.values()];

		if (databaseMissions.length && AwdbStore.enabled() !== true) {
			const documentedIds = new Set(documentMissions.map(mission => mission.id));
			await Promise.all(databaseMissions
				.filter(mission => !documentedIds.has(mission.id))
				.map(mission => JsonStore.save(config, mission)));
		}

		return missions.sort((left, right) => {
			return String(right.updatedAt).localeCompare(String(left.updatedAt));
		});
	}

	return {
		all,
		create,
		ensure,
		load,
		save,
		saveJson: JsonStore.save
	};
}

module.exports = {
	createStorage
};
