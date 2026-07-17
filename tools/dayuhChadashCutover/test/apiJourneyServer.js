// B"H
// Boruch Hashem
// Blessed is He

/** @file apiJourneyServer.js @description Starts an isolated real Awtsmoos server. */

const fs = require('fs');
const net = require('net');
const path = require('path');
const { spawn } = require('child_process');
const DosDB = require('../../../ayzarim/DosDB/index.js');
const { createApiKey } = require('../../../geelooy/api/social/helper/apiKeys.js');
const { request } = require('./apiJourneyHttp.js');

function freePort() {
	return new Promise((resolve, reject) => {
		const server = net.createServer();
		server.once('error', reject);
		server.listen(0, '127.0.0.1', () => {
			const port = server.address().port;
			server.close(error => error ? reject(error) : resolve(port));
		});
	});
}

async function seedApiKey(dbRoot, userId) {
	const db = new DosDB(dbRoot);
	await db.init();
	const made = await createApiKey({
		$i: {
			db,
			request: { user: { info: { userId } }, headers: {} },
			$_POST: { label: 'isolated dayuh release journey' }
		},
		userid: userId
	});
	if (!made.success?.key) throw new Error('B"H fixture API key was not created');
	return made.success.key;
}

function startServer(repositoryRoot, dbRoot, port, logRoot) {
	fs.mkdirSync(logRoot, { recursive: true });
	const stdout = fs.openSync(path.join(logRoot, 'server.out'), 'w');
	const stderr = fs.openSync(path.join(logRoot, 'server.err'), 'w');
	const receipt = path.join(logRoot, 'db-roots.jsonl');
	const guard = path.join(__dirname, 'apiJourneyChildGuard.js');
	const server = spawn(process.execPath, ['-r', guard, 'index.js'], {
		cwd: repositoryRoot,
		stdio: ['ignore', stdout, stderr],
		env: {
			...process.env,
			PORT: String(port),
			AWTSMOOS_DB_ROOT: dbRoot,
			AWTS_DB_ROOT: '',
			AWTSMOOS_TEST_DB_RECEIPT: receipt,
			AWTSMOOS_DISABLE_MAIL: 'true'
		}
	});
	fs.closeSync(stdout);
	fs.closeSync(stderr);
	return server;
}

async function waitForServer(server, origin, apiKey) {
	for (let attempt = 0; attempt < 80; attempt++) {
		if (server.exitCode !== null) {
			throw new Error(`B"H fixture server exited: ${server.exitCode}`);
		}
		try {
			const response = await request(
				origin,
				`/api/social/keys/verify?apiKey=${encodeURIComponent(apiKey)}`
			);
			if (response.status === 200 && !response.json?.error) return response;
		} catch {}
		await new Promise(resolve => setTimeout(resolve, 250));
	}
	throw new Error('B"H fixture server readiness timed out');
}

async function stopServer(server) {
	if (server.exitCode !== null) return;
	server.kill('SIGTERM');
	await Promise.race([
		new Promise(resolve => server.once('exit', resolve)),
		new Promise(resolve => setTimeout(resolve, 3000))
	]);
	if (server.exitCode === null) server.kill('SIGKILL');
}

module.exports = {
	freePort,
	seedApiKey,
	startServer,
	stopServer,
	waitForServer
};
