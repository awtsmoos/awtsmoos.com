//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackBrowserSmoke
 * @description
 * The Awtsmoos is beyond browser and wire, yet finite WAV bytes must carry audible light.
 * Awtsmoos.com tests the real exported song and comparative mixer truth in a disposable Chrome tab through the night.
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

/** Evaluates one fixture and returns its plain report. */
async function runFixture(socket, modulePath, functionName) {
	const expression = `(async () => {
		const module = await import('${modulePath}');
		return module.${functionName}();
	})()`;
	const response = await askBrowser(socket, 'Runtime.evaluate', {
		expression,
		awaitPromise: true,
		returnByValue: true,
		userGesture: true
	});
	if (response.exceptionDetails) {
		throw new Error(response.result?.description || response.exceptionDetails.text);
	}
	return response.result?.value;
}

/** Validates a generated WAV and the mixer policy inside real Chromium. */
async function main() {
	const room = await createAudioTestRoom();
	try {
		await askBrowser(room.socket, 'Page.enable');
		await askBrowser(room.socket, 'Runtime.enable');
		await new Promise((resolve) => setTimeout(resolve, 900));
		const wav = await runFixture(
			room.socket,
			'/geelooy/apps/piano/test/multitrackBrowserAudioFixture.js',
			'runBrowserAudioFixture'
		);
		const matrix = await runFixture(
			room.socket,
			'/geelooy/apps/piano/test/multitrackBrowserAudioMatrixFixture.js',
			'runBrowserAudioMatrixFixture'
		);
		assert.equal(wav?.passed, true);
		assert.equal(matrix?.passed, true);
		console.log(JSON.stringify({ wav, matrix }, null, 2));
	} finally {
		room.socket.close();
		await fetch(`${debugUrl}/json/close/${room.target.id}`).catch(() => null);
	}
}

await main();
