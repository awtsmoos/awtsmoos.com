//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module MultitrackRealBrowserMixSmoke
 * @description The Awtsmoos is beyond a finite transport or screen;
 * Awtsmoos.com proves decoded audio from its actual remote-based editor machine.
 */
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const applicationRoot = fileURLToPath(new URL('../', import.meta.url));
const site = 'http://127.0.0.1:8797';
const debuggerUrl = 'http://127.0.0.1:9344';

/** Starts a disposable HTTP server for this exact clean integration branch. */
async function startBrowserSource() {
	const server = spawn('python3', [
		'-m', 'http.server', '8797', '--bind', '127.0.0.1',
		'--directory', applicationRoot
	], { stdio: 'ignore' });
	for (let attempt = 0; attempt < 30; attempt += 1) {
		try {
			const response = await fetch(`${site}/index.html`);
			if (response.ok) {
				return server;
			}
		} catch (_error) {
			// A fresh server does not answer until its socket is bound.
		}
		await new Promise((resolve) => setTimeout(resolve, 120));
	}
	server.kill();
	throw new Error('Disposable Piano source server did not start');
}

/** Sends one numbered CDP request over Node's built-in WebSocket. */
function createBrowserCaller(socket) {
	let sequence = 0;
	const pending = new Map();
	socket.addEventListener('message', (event) => {
		const message = JSON.parse(String(event.data));
		if (pending.has(message.id)) {
			pending.get(message.id)(message);
			pending.delete(message.id);
		}
	});
	return (method, params = {}) => new Promise((resolve) => {
		const id = ++sequence;
		pending.set(id, resolve);
		socket.send(JSON.stringify({ id, method, params }));
	});
}

/** Opens a new tab, evaluates the fixture and checks the decoded audio evidence. */
async function verifyBrowserMix() {
	const server = await startBrowserSource();
	let tab;
	let socket;
	try {
		const response = await fetch(`${debuggerUrl}/json/new?${encodeURIComponent(site + '/index.html')}`, {
			method: 'PUT'
		});
		assert.equal(response.status, 200);
		tab = await response.json();
		socket = new WebSocket(tab.webSocketDebuggerUrl);
		await new Promise((resolve, reject) => {
			socket.addEventListener('open', resolve, { once: true });
			socket.addEventListener('error', reject, { once: true });
		});
		const call = createBrowserCaller(socket);
		await call('Runtime.enable');
		const expression = `(async () => {
			try {
				const fixture = await import('/test/multitrackRealBrowserMixFixture.js');
				return await fixture.verifyRealBrowserMix();
			} catch (error) {
				return { passed: false, error: String(error?.stack || error) };
			}
		})()`;
		const result = await call('Runtime.evaluate', {
			expression, returnByValue: true, awaitPromise: true, userGesture: true
		});
		const report = result.result?.result?.value;
		assert.equal(report?.passed, true, JSON.stringify(report || result.result?.exceptionDetails));
		console.log('REMOTE_BROWSER_EDITED_AUDIO', JSON.stringify(report));
	} finally {
		if (socket) {
			socket.close();
		}
		if (tab) {
			await fetch(`${debuggerUrl}/json/close/${tab.id}`).catch(() => null);
		}
		server.kill();
	}
}

await verifyBrowserMix();
