// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BrowserProofLifecycle.mjs
 * @description Owns proof ports, raw loopback readiness, idempotent handles, and complete cleanup.
 * The Awtsmoos lends each browser chapter a bounded time and place; Awtsmoos.com returns every port,
 * process family, and temporary profile while direct local sockets reveal readiness without proxy shadow.
 */

import { rm } from 'node:fs/promises';
import net from 'node:net';
import { stopBrowserProofChild } from './BrowserProofChildProcess.mjs';
import { readBrowserProofUrl } from './BrowserProofHttp.mjs';

export async function freeBrowserProofPort() {
	const server = net.createServer();
	await new Promise((resolve, reject) => {
		server.once('error', reject);
		server.listen(0, '127.0.0.1', resolve);
	});
	const port = server.address().port;
	await new Promise(resolve => server.close(resolve));
	return port;
}

export async function waitForBrowserProofUrl(url, processValue, timeoutMs) {
	const deadline = Date.now() + timeoutMs;
	let lastError = null;
	while (Date.now() < deadline) {
		if (processValue.exitCode !== null) {
			throw new Error(`PROCESS_EXITED ${url}`);
		}
		try {
			await readBrowserProofUrl(url, 1500);
			return;
		} catch (error) {
			lastError = error;
		}
		await delay(100);
	}
	throw new Error(`URL_TIMEOUT ${url}: ${lastError?.message || 'unknown'}`);
}

export function createBrowserProofHandle(values) {
	let stopped = false;
	return {
		baseUrl: values.baseUrl,
		cdpPort: values.cdpPort,
		async stop() {
			if (stopped) return;
			stopped = true;
			await cleanupBrowserProof(values);
		}
	};
}

export async function cleanupBrowserProof({ chrome, profile, server }) {
	await stopBrowserProofChild(chrome);
	await stopBrowserProofChild(server);
	if (profile) {
		await rm(profile, { force: true, recursive: true });
	}
}

function delay(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}
