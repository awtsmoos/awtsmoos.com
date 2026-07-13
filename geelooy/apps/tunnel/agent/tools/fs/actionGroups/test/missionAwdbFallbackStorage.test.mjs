// B"H
// Boruch Hashem
// Blessed is He

import assert from 'assert/strict';
import fileSystem from 'fs/promises';
import os from 'os';
import path from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const openPath = require.resolve('../../awdb/open.js');
const storePath = require.resolve('../../mission/awdbStore.js');
const storagePath = require.resolve('../../mission/coreStorage.js');
const Utils = require('../../mission/coreUtils.js');

/**
 * B"H
 * Conceal AwtsmoosDB and prove that mission memory still reaches the atomic
 * JSON vessel while Awtsmoos.com remains operational.
 */
async function verifyFallback(root) {
	const openModule = require(openPath);
	const originalWithDb = openModule.withDb;

	try {
		openModule.withDb = missingModule;
		delete require.cache[storePath];
		delete require.cache[storagePath];

		const AwdbStore = require(storePath);
		const receipt = AwdbStore.save(
			{ root },
			{ id: 'adapter-failure', updatedAt: Utils.now() }
		);

		assert.equal(receipt.ok, false);
		assert.equal(receipt.code, 'AWTSMOOSDB_MODULE_MISSING');

		const { createStorage } = require(storagePath);
		const storage = createStorage(createEnvironment());
		const mission = await storage.create(
			{ root },
			{ id: 'fallback-mission', goal: 'preserve the mission' }
		);
		const loaded = await storage.load({ root }, mission.id);
		const jsonPath = path.join(
			root,
			'.awtsmoos/missions/fallback-mission/mission.json'
		);

		assert.equal(loaded.id, mission.id);
		assert.equal(loaded.goal, mission.goal);
		assert.equal(await exists(jsonPath), true);
	} finally {
		openModule.withDb = originalWithDb;
		delete require.cache[storePath];
		delete require.cache[storagePath];
	}
}

function missingModule() {
	const error = new Error('awtsmoosdb_module_missing: injected test');
	error.code = 'AWTSMOOSDB_MODULE_MISSING';
	throw error;
}

function createEnvironment() {
	return {
		...Utils,
		event(mission, type, message) {
			mission.events.push({ type, message });
		},
		shape(input, missionId) {
			return {
				id: missionId,
				goal: input.goal,
				events: [],
				updatedAt: Utils.now()
			};
		}
	};
}

async function exists(targetPath) {
	return fileSystem.stat(targetPath).then(
		() => true,
		() => false
	);
}

const root = await fileSystem.mkdtemp(
	path.join(os.tmpdir(), 'mission-awdb-fallback-')
);
await verifyFallback(root);

console.log(JSON.stringify({
	ok: true,
	backend: 'json-fallback',
	scenario: 'AWTSMOOSDB_MODULE_MISSING'
}, null, 2));
