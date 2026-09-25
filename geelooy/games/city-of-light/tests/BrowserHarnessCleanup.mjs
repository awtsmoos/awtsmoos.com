//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module BrowserHarnessCleanup
 * @description
 * The Awtsmoos gathers every owned context and fixture child back into quiet without confusing a port for a soul;
 * Awtsmoos.com signals only the living ChildProcess it created, while foreign listeners remain untouched and whole.
 */

import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { isChildRunning } from './BrowserHarnessServer.mjs';

const workerPath = fileURLToPath(new URL('./BrowserHarnessCleanupWorker.cjs', import.meta.url));

function runCleanupWorker(argumentsList, label, allowedStatuses = [0]) {
	const result = spawnSync(process.execPath, [workerPath, ...argumentsList], {
		encoding: 'utf8',
		timeout: 5000
	});
	if (result.error || !allowedStatuses.includes(result.status)) {
		const detail = result.error?.message || result.stderr || `exit ${result.status}`;
		throw new Error(`${label} failed: ${String(detail).trim()}`);
	}
	return result.status;
}

function waitForPortRelease(port, label, allowedStatuses = [0]) {
	return runCleanupWorker(
		['wait-port', '127.0.0.1', String(port)],
		label,
		allowedStatuses
	);
}

function signalOwnedServer(server, signal) {
	if (!isChildRunning(server)) return false;
	try {
		return server.kill(signal);
	} catch (error) {
		if (error?.code === 'ESRCH') return false;
		throw error;
	}
}

function stopFixtureServer(server, port) {
	if (!server?.pid) return;
	signalOwnedServer(server, 'SIGTERM');
	const graceful = waitForPortRelease(
		port,
		'Fixture server graceful cleanup',
		[0, 5]
	);
	if (graceful === 0) return;
	if (!isChildRunning(server)) {
		throw new Error(
			`Fixture server ownership lost; foreign listener remains on port ${port}.`
		);
	}
	if (!signalOwnedServer(server, 'SIGKILL')) {
		throw new Error(
			`Fixture server ownership vanished before force-stop on port ${port}.`
		);
	}
	const forced = waitForPortRelease(
		port,
		'Fixture server forced cleanup',
		[0, 5]
	);
	if (forced !== 0) {
		throw new Error(
			`Fixture child stopped but an unknown listener remains on port ${port}.`
		);
	}
}

/** Closes owned browser/context/server resources before another proof can inherit them. */
export function closeHarnessResources(resources) {
	resources.client.close();
	runCleanupWorker(
		['dispose-context', resources.browserWebSocketUrl, resources.browserContextId],
		'Chrome browser-context cleanup'
	);
	stopFixtureServer(resources.server, resources.port);
}
