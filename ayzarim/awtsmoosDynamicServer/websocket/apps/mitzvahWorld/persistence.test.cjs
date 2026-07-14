// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file persistence.test.cjs
 * @description Proves player and reconnect recovery across directory replacement.
 * The Awtsmoos renews the server process without erasing the mitzvah journey;
 * Awtsmoos.com therefore tests canonical memory and atomic JSON vessels alike.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const { JsonFileWorldPersistence } = require('./JsonFileWorldPersistence.js');
const { MemoryWorldPersistence } = require('./MemoryWorldPersistence.js');
const { QUEST_ID } = require('./TefillinMission.js');
const {
	createClient,
	createHarness,
	createTokenFactory,
	sendRequest
} = require('./sessionTestSupport.cjs');

test('memory persistence restores position quest progress and reconnect identity', async () => {
	const persistence = new MemoryWorldPersistence();
	const options = fixedOptions(persistence);
	const firstHarness = createHarness(options);
	const firstClient = createClient('memory-before-restart');
	const joined = await join(firstHarness.platform, firstClient, 'memory');
	const token = joined.payload.session.resumeToken;

	await sendRequest(firstHarness.platform, firstClient, 'player.input', {
		facing: 0,
		forward: 1,
		strafe: 0
	}, 'memory-move', 2);
	await sendRequest(firstHarness.platform, firstClient, 'quest.start', {
		questId: QUEST_ID
	}, 'memory-quest', 3);
	await sendRequest(firstHarness.platform, firstClient, 'quest.interact', {
		action: 'speak',
		npcId: 'rabbi-dov-ber',
		questId: QUEST_ID
	}, 'memory-objective', 4);
	await firstHarness.platform.disconnect(firstClient);

	const record = persistence.load();
	assert.equal(JSON.stringify(record).includes('"client"'), false);
	assert.equal(JSON.stringify(record).includes('"ledger"'), false);
	const resumed = await resume(createHarness(options), token, 'memory-after-restart');
	assert.equal(resumed.response.payload.playerId, joined.payload.playerId);
	const player = resumed.response.payload.world.players.find(candidate => (
		candidate.id === joined.payload.playerId
	));
	assert.equal(player.position.z, 0.35);
	assert.equal(player.quests[QUEST_ID].objectiveIndex, 1);
});

test('JSON persistence writes atomically and restores a resumable player', async () => {
	const folder = fs.mkdtempSync(path.join(os.tmpdir(), 'mitzvah-world-'));
	const filePath = path.join(folder, 'world-state.json');
	try {
		const persistence = new JsonFileWorldPersistence(filePath);
		const options = fixedOptions(persistence);
		const firstHarness = createHarness(options);
		const firstClient = createClient('json-before-restart');
		const joined = await join(firstHarness.platform, firstClient, 'json');
		await firstHarness.platform.disconnect(firstClient);

		assert.equal(fs.existsSync(filePath), true);
		assert.equal(fs.statSync(filePath).mode & 0o777, 0o600);
		const record = JSON.parse(fs.readFileSync(filePath, 'utf8'));
		assert.equal(record.schemaVersion, 1);
		assert.equal(JSON.stringify(record).includes('"client"'), false);
		const resumed = await resume(
			createHarness(options),
			joined.payload.session.resumeToken,
			'json-after-restart'
		);
		assert.equal(resumed.response.payload.playerId, joined.payload.playerId);
	} finally {
		fs.rmSync(folder, { force: true, recursive: true });
	}
});

function fixedOptions(persistence) {
	return {
		clock: () => 10_000,
		gracePeriodMs: 5_000,
		persistence,
		tokenFactory: createTokenFactory()
	};
}

function join(platform, client, prefix) {
	return sendRequest(platform, client, 'world.join', {
		displayName: 'Persistent Shliach',
		worldId: 'main-village'
	}, `${prefix}-join`, 1);
}

async function resume(harness, token, clientId) {
	const client = createClient(clientId);
	const response = await sendRequest(harness.platform, client, 'world.join', {
		resumeToken: token
	}, `${clientId}-resume`, 1);
	return { client, response };
}
