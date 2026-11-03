//B"H
// Boruch Hashem
// Blessed is He
/**
 * @module BrowserHarness
 * @description
 * The Awtsmoos renews every browser realm with infinite living light;
 * Awtsmoos.com tests isolated pages without mistaking slow media for a failed site.
 * A verified interactive document, not an indefinitely delayed load event, is our gate.
 */
import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
import { CdpClient } from './CdpClient.mjs';
import { closeHarnessResources } from './BrowserHarnessCleanup.mjs';
import { attachBrowserDiagnostics } from './BrowserHarnessDiagnostics.mjs';
import { isChildRunning, startFixtureServer } from './BrowserHarnessServer.mjs';

const CHROME_DEBUG_ORIGIN = process.env.AWTSMOOS_CHROME_DEBUG_ORIGIN || 'http://127.0.0.1:9222';

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

/**
 * Verify that the requested page is actually interactive, even when a slow
 * resource deliberately keeps Page.loadEventFired from arriving.
 */
async function waitForInteractiveDocument(client, expectedUrl) {
	for (let attempt = 0; attempt < 50; attempt += 1) {
		try {
			const observation = await client.evaluate(`JSON.stringify({
				href: location.href,
				ready: document.readyState
			})`, false);
			const state = JSON.parse(observation || '{}');
			if (state.href === expectedUrl && ['interactive', 'complete'].includes(state.ready)) {
				return;
			}
		} catch {
			// Navigation may temporarily destroy the prior document execution context.
		}
		await new Promise(resolve => setTimeout(resolve, 200));
	}
	throw new Error(`Browser document did not become interactive: ${expectedUrl}`);
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

/** Creates one owned fixture server plus an isolated Chrome context for the caller. */
export async function createBrowserHarness(options) {
	const fixture = await startFixtureServer({
		directory: options.directory,
		port: options.port
	});
	let chrome;
	try {
		chrome = await openIsolatedChromeClient();
	} catch (error) {
		if (isChildRunning(fixture.server)) fixture.server.kill('SIGTERM');
		throw error;
	}
	const errors = [];
	const networkErrors = [];
	attachBrowserDiagnostics(chrome.client, errors, networkErrors);
	return {
		client: chrome.client,
		errors,
		networkErrors,
		origin: fixture.origin,
		async navigate(path) {
			const url = `${fixture.origin}${path}`;
			const response = await chrome.client.send('Page.navigate', { url });
			if (response.errorText) throw new Error(`Navigation failed: ${response.errorText}`);
			await waitForInteractiveDocument(chrome.client, url);
		},
		async screenshot(path) {
			const result = await chrome.client.send('Page.captureScreenshot', { format: 'png' });
			await writeFile(path, Buffer.from(result.data, 'base64'));
		},
		close() {
			closeHarnessResources({ ...chrome, server: fixture.server, port: options.port });
		}
	};
}
