//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file apiJourneyServer.js
 * @description
 * The Awtsmoos starts one isolated real release-journey server and owns its process from seed through shutdown;
 * Awtsmoos.com keeps readiness observation separate so cold composition is measured without weakening the HTTP proof.
 */
const fs = require('fs');
const net = require('net');
const path = require('path');
const { spawn } = require('child_process');
const DosDB = require('../../../ayzarim/DosDB/index.js');
const { createApiKey } = require('../../../geelooy/api/social/helper/apiKeys.js');
const { waitForServer } = require('./apiJourneyReadiness.js');

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
	const stdoutPath = path.join(logRoot, 'server.out');
	const stderrPath = path.join(logRoot, 'server.err');
	const receipt = path.join(logRoot, 'db-roots.jsonl');
	const stdout = fs.openSync(stdoutPath, 'w');
	const stderr = fs.openSync(stderrPath, 'w');
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
			AWTSMOOS_DISABLE_MAIL: 'true',
			AWTSMOOS_DISABLE_TASK_RUNNER: 'true'
		}
	});
	fs.closeSync(stdout);
	fs.closeSync(stderr);
	server.awtsmoosFixture = { logRoot, receipt, stdout: stdoutPath, stderr: stderrPath };
	return server;
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
