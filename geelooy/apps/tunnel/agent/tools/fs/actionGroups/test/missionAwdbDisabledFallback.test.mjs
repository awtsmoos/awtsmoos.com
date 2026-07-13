// B"H
// Boruch Hashem
// Blessed is He

import assert from 'assert/strict';
import fileSystem from 'fs/promises';
import os from 'os';
import path from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { buildMissionActions } = require('../missionActions.js');

/**
 * B"H
 * When the primary vessel is deliberately disabled, Awtsmoos.com must create,
 * reload, and visibly preserve the mission through atomic JSON fallback.
 */
async function verifyDisabledFallback() {
	const root = await fileSystem.mkdtemp(
		path.join(os.tmpdir(), 'mission-awdb-disabled-')
	);
	const config = {
		root,
		metadataRoot: path.join(root, '.metadata')
	};
	const start = await action(config, 'missionStart', {
		goal: 'action fallback mission'
	});
	const get = await action(config, 'missionGet', {
		missionId: start.missionId
	});
	const jsonPath = path.join(
		root,
		`.awtsmoos/missions/${start.missionId}/mission.json`
	);

	assert.equal(start.ok, true);
	assert.equal(get.ok, true);
	assert.equal(get.mission.id, start.missionId);
	assert.equal(await exists(jsonPath), true);
}

async function action(config, actionName, payload) {
	return buildMissionActions({
		config,
		payload: {
			action: actionName,
			...payload
		}
	})[actionName]();
}

async function exists(targetPath) {
	return fileSystem.stat(targetPath).then(
		() => true,
		() => false
	);
}

const previous = process.env.AWTSMOOS_MISSION_AWDB;
process.env.AWTSMOOS_MISSION_AWDB = '0';

try {
	await verifyDisabledFallback();
} finally {
	if (previous === undefined) {
		delete process.env.AWTSMOOS_MISSION_AWDB;
	} else {
		process.env.AWTSMOOS_MISSION_AWDB = previous;
	}
}

console.log(JSON.stringify({
	ok: true,
	backend: 'json-fallback',
	scenario: 'AWTSMOOSDB_DISABLED'
}, null, 2));
