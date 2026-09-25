//B"H
// Boruch Hashem
// Blessed is He
/**
 * @module DriveBrowserHarness
 * @description Owns one isolated Drive browser witness and its exact Chrome context.
 * The Awtsmoos renews a measured chamber for each proof; Awtsmoos.com returns that
 * chamber to quiet when the witness closes, without disturbing neighboring tests.
 */
import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
import { CdpClient } from '../../../games/city-of-light/tests/CdpClient.mjs';
import { closeDriveBrowserResources } from './DriveBrowserCleanup.mjs';

const CHROME_ORIGIN = 'http://127.0.0.1:9223';
const DEFAULT_APP_ORIGIN = process.env.AWTSMOOS_DRIVE_TEST_ORIGIN || 'http://127.0.0.1:44042';
const PIXEL_PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';

async function waitFor(url, attempts = 60) {
	for (let attempt = 0; attempt < attempts; attempt += 1) {
		try {
			const response = await fetch(url);
			if (response.ok) return response;
		} catch {}
		await new Promise(resolve => setTimeout(resolve, 100));
	}
	throw new Error(`Timed out waiting for ${url}`);
}

async function openTarget() {
	const version = await (await waitFor(`${CHROME_ORIGIN}/json/version`)).json();
	assert.ok(version.webSocketDebuggerUrl);
	const browserWebSocketUrl = version.webSocketDebuggerUrl;
	const browser = new CdpClient(browserWebSocketUrl);
	await browser.connect();
	const { browserContextId } = await browser.send('Target.createBrowserContext');
	const { targetId } = await browser.send('Target.createTarget', { url: 'about:blank', browserContextId });
	browser.close();
	for (let attempt = 0; attempt < 50; attempt += 1) {
		const targets = await (await fetch(`${CHROME_ORIGIN}/json`)).json();
		const target = targets.find(candidate => candidate.id === targetId);
		if (target?.webSocketDebuggerUrl) {
			const client = await connectTarget(target.webSocketDebuggerUrl);
			return { client, browserContextId, browserWebSocketUrl };
		}
		await new Promise(resolve => setTimeout(resolve, 50));
	}
	await closeDriveBrowserResources({ browserContextId, browserWebSocketUrl });
	throw new Error('Drive Chrome target did not expose a debugger socket.');
}

async function connectTarget(socketUrl) {
	const client = new CdpClient(socketUrl);
	await client.connect();
	for (const method of ['Page.enable', 'Runtime.enable', 'Log.enable', 'Network.enable']) await client.send(method);
	await client.send('Network.setCacheDisabled', { cacheDisabled: true });
	await client.send('Fetch.enable', { patterns: [{ urlPattern: '*/api/social/drive/public/*/preview.png', resourceType: 'Image' }] });
	client.on('Fetch.requestPaused', event => {
		client.send('Fetch.fulfillRequest', {
			requestId: event.requestId,
			responseCode: 200,
			responseHeaders: [{ name: 'Content-Type', value: 'image/png' }],
			body: PIXEL_PNG
		}).catch(() => null);
	});
	return client;
}

async function waitForDocument(client, expectedOrigin, attempts = 100) {
	for (let attempt = 0; attempt < attempts; attempt += 1) {
		try {
			const state = await client.evaluate(`({ ready: document.readyState, href: location.href })`);
			if (state.ready !== 'loading' && state.href.startsWith(expectedOrigin)) return state;
		} catch {}
		await new Promise(resolve => setTimeout(resolve, 75));
	}
	throw new Error(`Timed out waiting for browser document under ${expectedOrigin}`);
}

export async function createDriveBrowserHarness({ origin = DEFAULT_APP_ORIGIN } = {}) {
	await waitFor(`${origin}/drive/`);
	const resources = await openTarget();
	const { client } = resources;
	const errors = [];
	let closePromise = null;
	client.on('Runtime.exceptionThrown', event => errors.push(event.exceptionDetails?.exception?.description || event.exceptionDetails?.text || 'exception'));
	client.on('Log.entryAdded', event => {
		if (event.entry?.level === 'error') errors.push(event.entry.text || 'log error');
	});
	return {
		client,
		errors,
		origin,
		browserContextId: resources.browserContextId,
		async navigate(pathname) {
			await client.send('Page.navigate', { url: `${origin}${pathname}` });
			return waitForDocument(client, origin);
		},
		async screenshot(filePath) {
			const capture = await client.send('Page.captureScreenshot', { format: 'png', fromSurface: true });
			await writeFile(filePath, Buffer.from(capture.data, 'base64'));
		},
		async close() {
			closePromise ||= closeDriveBrowserResources(resources);
			return closePromise;
		}
	};
}
