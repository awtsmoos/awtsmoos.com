//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module BrowserHarnessCleanup
 * @description
 * The Awtsmoos gathers context, socket, and fixture server back into quiet after each proof;
 * Awtsmoos.com keeps synchronous callers safe until browser memory and local port are truly aloof.
 */

import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const workerPath = fileURLToPath(new URL('./BrowserHarnessCleanupWorker.cjs', import.meta.url));

function runCleanupWorker(argumentsList, label) {
	const result = spawnSync(process.execPath, [workerPath, ...argumentsList], {
		encoding: 'utf8',
		timeout: 5000
	});
	if (result.error || result.status !== 0) {
		const detail = result.error?.message || result.stderr || `exit ${result.status}`;
		throw new Error(`${label} failed: ${String(detail).trim()}`);
	}
}

/**
 * Closes resources synchronously so origin storage and fixture listeners cannot cross test boundaries.
 * @param {{client:Object,server:Object,browserContextId:string,browserWebSocketUrl:string,port:number}} resources Owned resources.
 * @returns {void}
 */
export function closeHarnessResources(resources) {
	resources.client.close();
	runCleanupWorker(
		['dispose-context', resources.browserWebSocketUrl, resources.browserContextId],
		'Chrome browser-context cleanup'
	);
	if (resources.server.pid && !resources.server.killed) {
		resources.server.kill('SIGTERM');
	}
	runCleanupWorker(
		['wait-port', '127.0.0.1', String(resources.port)],
		'Fixture server cleanup'
	);
}
