//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module BrowserHarness
 * @description
 * The Awtsmoos gives every browser test its own context-world so origin memory cannot trespass across the road;
 * Awtsmoos.com disables stale cache and disposes the whole temporary world before the next witness bears its load.
 */
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { writeFile } from 'node:fs/promises';
import { CdpClient } from './CdpClient.mjs';
import { closeHarnessResources } from './BrowserHarnessCleanup.mjs';

const CHROME_DEBUG_ORIGIN = 'http://127.0.0.1:9222';

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

async function browserConnection() {
	const response = await fetch(`${CHROME_DEBUG_ORIGIN}/json/version`);
	assert.ok(response.ok, `Chrome version probe failed with ${response.status}`);
	const version = await response.json();
	assert.ok(version.webSocketDebuggerUrl, 'Chrome browser WebSocket must exist');
	return version.webSocketDebuggerUrl;
}

async function waitForTarget(targetId) {
	for (let attempt = 0; attempt < 40; attempt += 1) {
		const targets = await (await fetch(`${CHROME_DEBUG_ORIGIN}/json`)).json();
		const target = targets.find(candidate => candidate.id === targetId);
		if (target?.webSocketDebuggerUrl) return target;
		await new Promise(resolve => setTimeout(resolve, 25));
	}
	throw new Error(`Chrome target ${targetId} did not expose a debugger socket.`);
}

async function openIsolatedChromeClient() {
	const browserWebSocketUrl = await browserConnection();
	const browser = new CdpClient(browserWebSocketUrl);
	await browser.connect();
	const { browserContextId } = await browser.send('Target.createBrowserContext');
	const { targetId } = await browser.send('Target.createTarget', {
		url: 'about:blank',
		browserContextId
	});
	browser.close();
	const target = await waitForTarget(targetId);
	const client = new CdpClient(target.webSocketDebuggerUrl);
	await client.connect();
	for (const method of ['Page.enable', 'Runtime.enable', 'Log.enable', 'Network.enable']) {
		await client.send(method);
	}
	await client.send('Network.setCacheDisabled', { cacheDisabled: true });
	return { client, browserContextId, browserWebSocketUrl };
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

export async function createBrowserHarness(options) {
	const origin = `http://127.0.0.1:${options.port}`;
	const server = spawn('python3', [
		'-m', 'http.server', String(options.port), '--bind', '127.0.0.1', '--directory', options.directory
	], { stdio: 'ignore' });
	await waitForServer(origin);
	const chrome = await openIsolatedChromeClient();
	const errors = [];
	chrome.client.on('Runtime.exceptionThrown', event => errors.push(describeException(event)));
	chrome.client.on('Log.entryAdded', event => {
		if (event.entry?.level === 'error') errors.push(describeLog(event));
	});
	return {
		client: chrome.client,
		errors,
		origin,
		async navigate(path) {
			const loaded = chrome.client.waitFor('Page.loadEventFired');
			await chrome.client.send('Page.navigate', { url: `${origin}${path}` });
			await loaded;
		},
		async screenshot(path) {
			const result = await chrome.client.send('Page.captureScreenshot', { format: 'png' });
			await writeFile(path, Buffer.from(result.data, 'base64'));
		},
		close() {
			closeHarnessResources({ ...chrome, server, port: options.port });
		}
	};
}
