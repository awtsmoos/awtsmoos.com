// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module BookJobLauncher
 * @description Authenticated requests create durable config first, then release a detached generator.
 */
const path = require('path');
const { spawn } = require('child_process');
const store = require('./jobStore.js');

function launch({ heichelId, seriesId, options, userid, apiBase = 'http://127.0.0.1:8080' }) {
	const created = store.create({
		heichelId,
		seriesId,
		options,
		ownerUserId: userid,
		apiBase
	});
	const worker = path.join(__dirname, 'worker.js');
	const child = spawn(process.execPath, [worker, created.jobId], {
		cwd: process.cwd(),
		detached: true,
		stdio: 'ignore',
		env: { ...process.env }
	});
	child.unref();
	store.update(created.jobId, { workerPid: child.pid });
	return store.status(created.jobId);
}

module.exports = { launch };
