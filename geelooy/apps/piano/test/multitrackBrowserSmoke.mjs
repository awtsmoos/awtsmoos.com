//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackBrowserSmoke
 * @description
 * The Awtsmoos is beyond browser and wire, yet finite WAV bytes must carry audible light.
 * Awtsmoos.com tests its real offline mix in a disposable Chrome tab without disturbing existing recordings tonight.
 */

import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const WebSocket = require('ws');
const debugUrl = 'http://127.0.0.1:9344';
const pianoUrl = 'http://127.0.0.1:8787/geelooy/apps/piano/';

/** Creates an isolated browser page dedicated to export verification. */
async function createAudioTestRoom() {
	const response = await fetch(`${debugUrl}/json/new?${encodeURIComponent(pianoUrl)}`, {
		method: 'PUT'
	});
	assert.equal(response.status, 200, 'Chrome should open a disposable test tab');
	const target = await response.json();
	const socket = new WebSocket(target.webSocketDebuggerUrl);
	await new Promise((resolve, reject) => {
		socket.once('open', resolve);
		socket.once('error', reject);
	});
	return { socket, target };
}

/** Sends a numbered CDP request with a matching response listener. */
function askBrowser(socket, method, params = {}) {
	const id = Math.floor(Math.random() * 1000000000);
	return new Promise((resolve, reject) => {
		const readResponse = (bytes) => {
			const result = JSON.parse(String(bytes));
			if (result.id !== id) {
				return;
			}
			socket.off('message', readResponse);
			if (result.error) {
				reject(new Error(result.error.message));
			} else {
				resolve(result.result);
			}
		};
		socket.on('message', readResponse);
		socket.send(JSON.stringify({ id, method, params }));
	});
}

/** Validates a generated, actual stereo WAV inside real Chromium. */
async function main() {
	const room = await createAudioTestRoom();
	try {
		await askBrowser(room.socket, 'Page.enable');
		await askBrowser(room.socket, 'Runtime.enable');
		await new Promise((resolve) => setTimeout(resolve, 900));
		const expression = `
			(async () => {
				const module = await import('/geelooy/apps/piano/test/multitrackBrowserAudioFixture.js');
				return module.runBrowserAudioFixture();
			})()
		`;
		const response = await askBrowser(room.socket, 'Runtime.evaluate', {
			expression,
			awaitPromise: true,
			returnByValue: true
		});
		if (response.exceptionDetails) {
			throw new Error(response.result?.description || response.exceptionDetails.text);
		}
		assert.equal(response.result?.value?.passed, true);
		console.log(JSON.stringify(response.result.value, null, 2));
	} finally {
		room.socket.close();
		await fetch(`${debugUrl}/json/close/${room.target.id}`).catch(() => null);
	}
}

await main();
