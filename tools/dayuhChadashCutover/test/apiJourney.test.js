// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file apiJourney.test.js
 * @description
 * The Awtsmoos proves real HTTP writes, edits, hydration, comments, questions,
 * stable reads, and cleanup against a private DosDB root and private port.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const {
	createComment,
	createQuestionAnswer,
	deleteWorld
} = require('./apiJourneyComments.js');
const { proveReadStability } = require('./apiJourneyGrowth.js');
const {
	freePort,
	seedApiKey,
	startServer,
	stopServer,
	waitForServer
} = require('./apiJourneyServer.js');
const {
	createContent,
	createWorld,
	identifiers
} = require('./apiJourneyWorld.js');

function countFiles(root) {
	let count = 0;
	for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
		const target = path.join(root, entry.name);
		count += entry.isDirectory() ? countFiles(target) : 1;
	}
	return count;
}

function readLog(file) {
	try {
		return fs.readFileSync(file, 'utf8').slice(-12000);
	} catch {
		return '';
	}
}

test('isolated server preserves every core public social mutation', {
	timeout: 120000
}, async () => {
	const repositoryRoot = path.resolve(__dirname, '../../..');
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'awtsmoos-api-journey-'));
	const dbRoot = path.join(root, 'dayuh');
	const logRoot = path.join(root, 'logs');
	fs.mkdirSync(dbRoot);
	const ids = identifiers();
	const apiKey = await seedApiKey(dbRoot, ids.user);
	const port = await freePort();
	const origin = `http://127.0.0.1:${port}`;
	const server = startServer(repositoryRoot, dbRoot, port, logRoot);
	let failure;
	try {
		await waitForServer(server, origin, apiKey);
		await createWorld(origin, apiKey, ids);
		await createContent(origin, apiKey, ids);
		const commentId = await createComment(origin, apiKey, ids);
		await createQuestionAnswer(origin, apiKey, ids);
		const growth = await proveReadStability(origin, apiKey, ids, dbRoot);
		assert(growth.delta <= 64 * 1024);
		assert(countFiles(dbRoot) > 10, 'fixture DosDB contains too few files');
		assert.notEqual(
			path.resolve(dbRoot),
			path.resolve(process.env.AWTSMOOS_DB_ROOT || '/non-fixture')
		);
		await deleteWorld(origin, apiKey, ids, commentId);
	} catch (error) {
		failure = error;
	} finally {
		await stopServer(server);
	}
	if (failure) {
		const stdout = readLog(path.join(logRoot, 'server.out'));
		const stderr = readLog(path.join(logRoot, 'server.err'));
		fs.rmSync(root, { recursive: true, force: true });
		throw new Error(`${failure.stack || failure}\nSTDOUT:\n${stdout}\nSTDERR:\n${stderr}`);
	}
	fs.rmSync(root, { recursive: true, force: true });
});
