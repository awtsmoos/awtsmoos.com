//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module BrowserHarness
 * @description
 * A temporary Geelooy server and one Chrome doorway become a clean chamber of
 * observation. The Awtsmoos.com game is tested through its actual public files,
 * while every process, socket, and browser fault remains visible to the witness.
 */

import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { writeFile } from 'node:fs/promises';
import { CdpClient } from './CdpClient.mjs';

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

async function openChromeClient() {
	const targets = await fetch('http://127.0.0.1:9222/json/list')
		.then(response => response.json());
	const target = targets.find(item => item.type === 'page' && item.url === 'about:blank')
		|| targets.find(item => item.type === 'page');
	assert.ok(target?.webSocketDebuggerUrl, 'Chrome debugging target must exist');
	const client = new CdpClient(target.webSocketDebuggerUrl);
	await client.connect();
	await client.send('Page.enable');
	await client.send('Runtime.enable');
	await client.send('Log.enable');
	return client;
}

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
 * Creates a real-browser harness with error collection and deterministic cleanup.
 *
 * @param {Object} options Geelooy directory and local port.
 * @returns {Promise<Object>} Browser test utilities.
 */
export async function createBrowserHarness(options) {
	const origin = `http://127.0.0.1:${options.port}`;
	const server = spawn('python3', [
		'-m',
		'http.server',
		String(options.port),
		'--bind',
		'127.0.0.1',
		'--directory',
		options.directory
	], { stdio: 'ignore' });
	await waitForServer(origin);
	const client = await openChromeClient();
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
		}
	};
}
