//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackBrowserWebmSmoke
 * @description
 * The Awtsmoos is beyond recording time and encoded shape.
 * Awtsmoos.com tests real Opus playback in an isolated browser, not an empty export escape.
 */

import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const WebSocket = require('ws');
const debugUrl = 'http://127.0.0.1:9344';
const pianoUrl = 'http://127.0.0.1:8787/geelooy/apps/piano/';

/** Connects an isolated Chrome page without disturbing existing sessions. */
async function openWebmTestPage() {
	const response = await fetch(`${debugUrl}/json/new?${encodeURIComponent(pianoUrl)}`, {
		method: 'PUT'
	});
	assert.equal(response.status, 200, 'Chrome test page must open');
	const target = await response.json();
	const socket = new WebSocket(target.webSocketDebuggerUrl);
	await new Promise((resolve, reject) => {
		socket.once('open', resolve);
		socket.once('error', reject);
	});
	return { socket, target };
}

/** Calls one Chrome method, matching only its own numbered response. */
function sendWebmBrowserCommand(socket, method, params = {}) {
	const id = Math.floor(Math.random() * 1000000000);
	return new Promise((resolve, reject) => {
		const receive = (bytes) => {
			const result = JSON.parse(String(bytes));
			if (result.id !== id) {
				return;
			}
			socket.off('message', receive);
			if (result.error) {
				reject(new Error(result.error.message));
			} else {
				resolve(result.result);
			}
		};
		socket.on('message', receive);
		socket.send(JSON.stringify({ id, method, params }));
	});
}

/** Verifies browser audio bytes and samples with a real user-gesture context. */
async function runWebmSmoke() {
	const page = await openWebmTestPage();
	try {
		await sendWebmBrowserCommand(page.socket, 'Runtime.enable');
		const expression = `
			(async () => {
				try {
					const fixture = await import('/geelooy/apps/piano/test/multitrackBrowserWebmFixture.js');
					return await fixture.runBrowserWebmFixture();
				} catch (error) {
					return { passed: false, error: error?.message || String(error) };
				}
			})()
		`;
		const result = await sendWebmBrowserCommand(page.socket, 'Runtime.evaluate', {
			expression,
			awaitPromise: true,
			returnByValue: true,
			userGesture: true
		});
		assert.equal(result.exceptionDetails, undefined, 'WebM fixture should not throw');
		const report = result.result?.value;
		if (!report?.supported && report?.reason) {
			console.log('WEBM_UNSUPPORTED', report.reason);
			return;
		}
		assert.equal(report?.passed, true, JSON.stringify(report));
		console.log('WEBM_BROWSER_AUDIO', JSON.stringify(report));
	} finally {
		page.socket.close();
		await fetch(`${debugUrl}/json/close/${page.target.id}`).catch(() => null);
	}
}

await runWebmSmoke();
