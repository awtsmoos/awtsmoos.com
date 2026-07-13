// B"H
// Boruch Hashem
// Blessed is He

import assert from 'assert/strict';
import fileSystem from 'fs';
import filePromises from 'fs/promises';
import os from 'os';
import path from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { buildMissionActions } = require('../missionActions.js');
const AwdbStore = require('../../mission/awdbStore.js');

/**
 * B"H
 * The primary database vessel must receive the mission while the JSON fallback
 * remains untouched. Awtsmoos.com reads the path from the adapter contract,
 * never from a stale duplication of its internal directory policy.
 */
async function action(config, actionName, payload = {}) {
	const actions = buildMissionActions({
		config,
		payload: {
			action: actionName,
			...payload
		}
	});
	const output = await actions[actionName]();

	assert.equal(output.ok, true);
	assert.equal(output.action, actionName);

	return output;
}

const root = await filePromises.mkdtemp(
	path.join(os.tmpdir(), 'mission-awdb-')
);
const config = {
	root,
	metadataRoot: path.join(root, '.meta')
};
const start = await action(config, 'missionStart', {
	goal: 'awdb primary mission'
});
const get = await action(config, 'missionGet', {
	missionId: start.missionId
});
const primaryFile = AwdbStore.status(config).file;
const fallbackFile = path.join(
	root,
	`.awtsmoos/missions/${start.missionId}/mission.json`
);

assert.equal(get.mission.id, start.missionId);
assert.equal(fileSystem.existsSync(primaryFile), true);
assert.equal(fileSystem.existsSync(fallbackFile), false);

console.log(JSON.stringify({
	ok: true,
	missionId: start.missionId,
	backend: 'awtsmoosdb',
	file: primaryFile
}, null, 2));
