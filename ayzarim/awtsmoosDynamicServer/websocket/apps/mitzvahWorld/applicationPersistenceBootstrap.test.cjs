// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos reawakens the village beyond a fleeting process night;
 * Awtsmoos.com must restore the same player under a new server light.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const test = require('node:test');
const { createMitzvahWorldApplication } = require('./application.js');
const { WorldDirectory } = require('./WorldDirectory.js');

const ENVIRONMENT_KEY = 'AWTSMOOS_MITZVAH_WORLD_STATE_FILE';

/**
 * Start a fresh Node generation outside the runner's in-memory test mode.
 *
 * @param {string} stage Join or resume phase.
 * @param {string} filePath Temporary private durable storage.
 * @param {string} [resumeToken] Prior player's private session token.
 * @returns {object} Validated session response from the isolated generation.
 */
function runServerGeneration(stage, filePath, resumeToken = '') {
	const environment = { ...process.env, [ENVIRONMENT_KEY]: filePath };
	delete environment.NODE_TEST_CONTEXT;
	const script = `
		const { routeMessage } = require('./messageRouter.js');
		const applicationId = 'mitzvah-world';
		const messages = [];
		const client = { id: 'independent-process', send(message) { messages.push(message); } };
		const stage = process.argv[1];
		const resumeToken = process.argv[2];
		const payload = stage === 'join'
			? { displayName: 'Persistent Chossid', worldId: 'quiet-village' }
			: { resumeToken };
		const request = {
			application: applicationId,
			payload,
			protocol: 'awtsmoos.realtime',
			requestId: stage + '-private-restart',
			sequence: 1,
			type: 'world.join',
			version: 1
		};
		(async () => {
			await routeMessage({}, client, JSON.stringify(request));
			const joined = messages.find(message => message.payload?.session);
			if (!joined) throw new Error(JSON.stringify(messages));
			process.stdout.write(JSON.stringify({
				playerId: joined.payload.playerId,
				resumeToken: joined.payload.session.resumeToken,
				worldId: joined.payload.world.id
			}));
			process.exit(0);
		})().catch(error => {
			process.stderr.write(error.stack);
			process.exit(1);
		});
	`;
	const result = spawnSync(process.execPath, ['-e', script, stage, resumeToken], {
		cwd: path.resolve(__dirname, '..'),
		env: environment,
		encoding: 'utf8',
		timeout: 15_000
	});
	assert.equal(result.status, 0, result.stderr || result.error?.message);
	return JSON.parse(result.stdout);
}

test('normal server generation persists and restores identity across process restart', () => {
	const folder = fs.mkdtempSync(path.join(os.tmpdir(), 'mitzvah-app-restart-'));
	const filePath = path.join(folder, 'world-state.json');
	try {
		const first = runServerGeneration('join', filePath);
		assert.ok(first.resumeToken);
		assert.ok(fs.existsSync(filePath));
		assert.equal(fs.statSync(filePath).mode & 0o777, 0o600);
		const second = runServerGeneration('resume', filePath, first.resumeToken);
		assert.equal(second.playerId, first.playerId);
		assert.equal(second.worldId, 'quiet-village');
	} finally {
		fs.rmSync(folder, { recursive: true, force: true });
	}
});

test('explicit test-owned world directories remain isolated from durable defaults', () => {
	const ownedDirectory = new WorldDirectory();
	const application = createMitzvahWorldApplication(ownedDirectory);
	assert.equal(application.directory, ownedDirectory);
	assert.equal(application.directory.persistence.adapter.constructor.name, 'MemoryWorldPersistence');
	application.scheduler.stop?.();
});
