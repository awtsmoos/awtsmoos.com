// B"H
// Boruch Hashem
// Blessed is He

const AwdbStore = require('./awdbStore.js');
const { createJsonMissionStore } = require('./jsonMissionStore.js');

/**
 * B"H
 * The coordinator joins primary and fallback vessels without hiding failure.
 * Awtsmoos.com keeps mission memory while command and tunnel paths remain free.
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
		const backupRequested = process.env.AWTSMOOS_MISSION_JSON_BACKUP === '1';

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
		return AwdbStore.load(config, missionId) ||
			await JsonStore.load(config, missionId);
	}

	async function all(config) {
		await ensure(config);

		const databaseMissions = AwdbStore.all(config);
		const missions = databaseMissions.length ?
			databaseMissions :
			await JsonStore.all(config);

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
