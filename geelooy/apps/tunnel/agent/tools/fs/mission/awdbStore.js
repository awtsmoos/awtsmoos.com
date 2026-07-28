// B"H
// Boruch Hashem
// Blessed is He

const fileSystem = require('fs');
const { withDb, dbFile } = require('../awdb/open.js');
const Collections = require('../awdb/collections.js');

/**
 * B"H
 * AwtsmoosDB remains an explicit or legacy mission-memory vessel. The atomic
 * per-mission store is the scalable default; the monolithic database can still
 * be selected deliberately and old databases remain readable for migration.
 */
function enabled() {
	return process.env.AWTSMOOS_MISSION_AWDB === '1';
}

function readable(config) {
	return process.env.AWTSMOOS_MISSION_AWDB !== '0' &&
		fileSystem.existsSync(dbFile(config, 'missions'));
}

function failure(config, mission, error) {
	return {
		ok: false,
		backend: 'awtsmoosdb',
		file: dbFile(config, 'missions'),
		id: mission?.id || '',
		code: error?.code || 'AWTSMOOSDB_WRITE_FAILED',
		error: String(error?.message || error || 'AwtsmoosDB write failed')
	};
}

/**
 * Persist one mission without allowing an optional adapter failure to escape.
 *
 * @param {object} config Tunnel filesystem configuration.
 * @param {object} mission Mission document to persist.
 * @returns {object} Primary-store receipt.
 */
function save(config, mission) {
	if (!enabled()) {
		return {
			ok: false,
			backend: 'awtsmoosdb',
			skipped: true,
			code: 'AWTSMOOSDB_DISABLED',
			file: dbFile(config, 'missions'),
			id: mission?.id || ''
		};
	}

	try {
		return withDb(config, 'missions', database => {
			const missions = Collections.ensure(database.root, 'missions');
			const byId = Collections.ensure(missions, 'byId');
			const order = Collections.ensure(missions, 'order');

			byId[mission.id] = Collections.plain(mission);
			order[mission.id] = mission.updatedAt || new Date().toISOString();

			return {
				ok: true,
				backend: 'awtsmoosdb',
				file: dbFile(config, 'missions'),
				id: mission.id
			};
		});
	} catch (error) {
		return failure(config, mission, error);
	}
}

function load(config, id) {
	if ((!enabled() && !readable(config)) || !id) {
		return null;
	}

	try {
		return withDb(config, 'missions', database => {
			const missions = Collections.ensure(database.root, 'missions');
			const byId = Collections.ensure(missions, 'byId');
			return Collections.plain(byId[id]);
		});
	} catch {
		return null;
	}
}

function all(config) {
	if (!enabled() && !readable(config)) {
		return [];
	}

	try {
		return withDb(config, 'missions', database => {
			const missions = Collections.ensure(database.root, 'missions');
			const byId = Collections.ensure(missions, 'byId');
			return Collections.values(byId);
		});
	} catch {
		return [];
	}
}

function status(config) {
	return {
		enabled: enabled(),
		legacyReadable: readable(config),
		mode: enabled() ? 'explicit-primary' : 'legacy-read-only',
		backend: 'awtsmoosdb',
		file: dbFile(config, 'missions')
	};
}

module.exports = {
	all,
	enabled,
	failure,
	load,
	readable,
	save,
	status
};
