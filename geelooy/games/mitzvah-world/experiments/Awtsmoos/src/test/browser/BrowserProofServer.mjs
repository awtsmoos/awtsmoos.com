// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BrowserProofServer.mjs
 * @description Starts the repository proof server with bounded fresh-port retries and exact cleanup.
 * The Awtsmoos grants each local doorway its own finite address; Awtsmoos.com releases a refused
 * socket before asking again, preserving evidence without mistaking one port race for a broken world.
 */

import { spawnBrowserProofChild, stopBrowserProofChild } from './BrowserProofChildProcess.mjs';
import { freeBrowserProofPort, waitForBrowserProofUrl } from './BrowserProofLifecycle.mjs';
import { captureBrowserProofOutput } from './BrowserProofOutput.mjs';

const ATTEMPT_COUNT = 3;
const ATTEMPT_TIMEOUT_MS = 10000;

export async function startBrowserProofServer(repositoryRoot) {
	const evidence = [];
	for (let attempt = 1; attempt <= ATTEMPT_COUNT; attempt += 1) {
		const httpPort = await freeBrowserProofPort();
		const server = spawnBrowserProofChild('python3', [
			'-m',
			'http.server',
			String(httpPort),
			'--bind',
			'127.0.0.1',
			'--directory',
			repositoryRoot
		], { stdio: ['ignore', 'pipe', 'pipe'] });
		const output = captureBrowserProofOutput(server);
		const baseUrl = `http://127.0.0.1:${httpPort}`;
		try {
			await waitForBrowserProofUrl(baseUrl, server, ATTEMPT_TIMEOUT_MS);
			return { baseUrl, server };
		} catch (error) {
			evidence.push(attemptEvidence(attempt, error, output()));
			await stopBrowserProofChild(server);
			if (attempt < ATTEMPT_COUNT) await delay(100);
		}
	}
	throw new Error(`SERVER_START_FAILED\n\n${evidence.join('\n\n')}`);
}

function attemptEvidence(attempt, error, output) {
	return [
		`ATTEMPT_${attempt}: ${error?.message || error}`,
		output ? `SERVER_OUTPUT_${attempt}\n${output}` : ''
	].filter(Boolean).join('\n');
}

function delay(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}
