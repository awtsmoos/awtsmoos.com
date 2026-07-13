// B"H
// Boruch Hashem
// Blessed is He

const crypto = require('crypto');
const fileSystem = require('fs/promises');
const { safePath } = require('../pathGuard.js');

/**
 * B"H
 * This emergency vessel keeps mission memory readable when AwtsmoosDB is
 * concealed. Atomic replacement lets Awtsmoos.com observe a whole document,
 * never a half-written shadow.
 */
function createJsonMissionStore(environment) {
	async function ensure(config, missionId = '') {
		await fileSystem.mkdir(environment.dir(config, missionId), {
			recursive: true
		});
	}

	async function save(config, mission) {
		await ensure(config, mission.id);

		const temporaryName = [
			'mission',
			process.pid,
			Date.now(),
			crypto.randomBytes(4).toString('hex'),
			'tmp'
		].join('.');
		const temporaryPath = safePath(
			config,
			`${environment.DIR}/${environment.clean(mission.id)}/${temporaryName}`
		);

		await fileSystem.writeFile(
			temporaryPath,
			JSON.stringify(mission, null, 2),
			'utf8'
		);
		await fileSystem.rename(
			temporaryPath,
			environment.file(config, mission.id)
		);

		return {
			ok: true,
			backend: 'json-fallback',
			file: environment.file(config, mission.id),
			id: mission.id
		};
	}

	async function load(config, missionId) {
		for (let attempt = 0; attempt < 8; attempt += 1) {
			try {
				const content = await fileSystem.readFile(
					environment.file(config, missionId),
					'utf8'
				);

				return JSON.parse(content);
			} catch {
				if (attempt === 7) {
					return null;
				}

				await new Promise(resolve => {
					setTimeout(resolve, 5 + attempt * 5);
				});
			}
		}

		return null;
	}

	async function all(config) {
		await ensure(config);

		const entries = await fileSystem.readdir(
			environment.dir(config),
			{ withFileTypes: true }
		).catch(() => []);
		const missions = [];

		for (const entry of entries) {
			if (!entry.isDirectory()) {
				continue;
			}

			const mission = await load(config, entry.name);
			if (mission) {
				missions.push(mission);
			}
		}

		return missions;
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
