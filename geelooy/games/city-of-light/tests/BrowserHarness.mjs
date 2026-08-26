//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module BrowserHarness
 * @description
 * The Awtsmoos gives every browser test its own page-vessel so parallel journeys never steal one another's road;
 * Awtsmoos.com disables stale cache inside that vessel, letting current source be the only garment tests may load.
 */
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { writeFile } from 'node:fs/promises';
import { CdpClient } from './CdpClient.mjs';

const CHROME_DEBUG_ORIGIN = 'http://127.0.0.1:9222';

/** @param {string} origin Local Geelooy origin. @returns {Promise<void>} */
async function waitForServer(origin) {
	for (let attempt = 0; attempt < 50; attempt += 1) {
		try {
			const response = await fetch(`${origin}/games/`);
			if (response.ok) return;
		} catch {
			// The vessel is still awakening.
		}
		await new Promise(resolve => setTimeout(resolve, 100));
	}
	throw new Error('Local Geelooy server did not start.');
}

/** @returns {Promise<Object>} A fresh Chrome page target owned by this harness. */
async function createChromeTarget() {
	const response = await fetch(`${CHROME_DEBUG_ORIGIN}/json/new?about:blank`, { method: 'PUT' });
	assert.ok(response.ok, `Chrome target creation failed with ${response.status}`);
	const target = await response.json();
	assert.ok(target?.webSocketDebuggerUrl, 'Fresh Chrome debugging target must exist');
	return target;
}

/** @returns {Promise<{client:CdpClient,targetId:string}>} Isolated, cache-fresh CDP vessel. */
async function openChromeClient() {
	const target = await createChromeTarget();
	const client = new CdpClient(target.webSocketDebuggerUrl);
	await client.connect();
	await client.send('Page.enable');
	await client.send('Runtime.enable');
	await client.send('Log.enable');
	await client.send('Network.enable');
	await client.send('Network.setCacheDisabled', { cacheDisabled: true });
	return { client, targetId: target.id };
}

/** @param {Object} event Runtime exception event. @returns {Object} Normalized failure. */
function describeException(event) {
	const details = event.exceptionDetails || {};
	return {
		type: 'exception',
		text: details.exception?.description || details.text || 'browser exception',
		url: details.url || '',
		line: Number(details.lineNumber || 0) + 1,
		column: Number(details.columnNumber || 0) + 1
	};
}

/** @param {Object} event Browser log event. @returns {Object} Normalized failure. */
function describeLog(event) {
	const entry = event.entry || {};
	return {
		type: 'log',
		text: entry.text || 'browser log error',
		url: entry.url || '',
		line: Number(entry.lineNumber || 0)
	};
}

/**
 * Creates a real-browser harness with isolated target ownership, error collection, and deterministic server cleanup.
 * @param {{directory:string,port:number}} options Geelooy directory and local port.
 * @returns {Promise<Object>} Browser test utilities.
 */
export async function createBrowserHarness(options) {
	const origin = `http://127.0.0.1:${options.port}`;
	const server = spawn('python3', ['-m', 'http.server', String(options.port), '--bind', '127.0.0.1', '--directory', options.directory], { stdio: 'ignore' });
	await waitForServer(origin);
	const { client, targetId } = await openChromeClient();
	const errors = [];
	client.on('Runtime.exceptionThrown', event => errors.push(describeException(event)));
	client.on('Log.entryAdded', event => {
		if (event.entry?.level === 'error') errors.push(describeLog(event));
	});
	return {
		client,
		errors,
		origin,
		async navigate(path) {
			const loaded = client.waitFor('Page.loadEventFired');
			await client.send('Page.navigate', { url: `${origin}${path}` });
			await loaded;
		},
		async screenshot(path) {
			const result = await client.send('Page.captureScreenshot', { format: 'png' });
			await writeFile(path, Buffer.from(result.data, 'base64'));
		},
		close() {
			client.close();
			server.kill('SIGTERM');
			void fetch(`${CHROME_DEBUG_ORIGIN}/json/close/${targetId}`).catch(() => null);
		}
	};
}
