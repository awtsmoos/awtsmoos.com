// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file browser-runtime-port-probe.mjs
 * @description Reloads a chosen Chrome target and records complete runtime and screenshot evidence.
 * The Awtsmoos renews network, module, canvas, and frame as one observable stream;
 * Awtsmoos.com proves that rich rendering and playable state awaken without a hidden scream.
 */

import { writeFile } from 'node:fs/promises';

const debugPort = Number(process.argv[2] || 9242);
const requestedUrl = process.argv[3] || 'http://localhost:8080/games/mitzvahWorld/';
const screenshotPath = process.argv[4] || 'browser-runtime-port-proof.png';
const targets = await fetch(`http://127.0.0.1:${debugPort}/json/list`).then((response) => {
	return response.json();
});
const target = targets.find((candidate) => candidate.url === requestedUrl)
	|| targets.find((candidate) => candidate.type === 'page');

if (!target?.webSocketDebuggerUrl) {
	throw new Error(`No debuggable page target exists for ${requestedUrl}`);
}

const socket = new WebSocket(target.webSocketDebuggerUrl);
const pendingCommands = new Map();
const evidence = {
	consoleErrors: [],
	exceptions: [],
	failedRequests: [],
	httpErrors: []
};
let commandId = 0;

socket.addEventListener('message', (event) => {
	const message = JSON.parse(event.data);

	if (message.id && pendingCommands.has(message.id)) {
		const pending = pendingCommands.get(message.id);
		pendingCommands.delete(message.id);
		message.error ? pending.reject(message.error) : pending.resolve(message.result);
		return;
	}

	collectEvent(message);
});

await new Promise((resolve, reject) => {
	socket.addEventListener('open', resolve, { once: true });
	socket.addEventListener('error', reject, { once: true });
});

await Promise.all([
	sendCommand('Log.enable'),
	sendCommand('Network.enable'),
	sendCommand('Page.enable'),
	sendCommand('Runtime.enable')
]);
await sendCommand('Page.reload', { ignoreCache: true });
await wait(20000);

const pageState = await evaluatePageState();
const screenshot = await sendCommand('Page.captureScreenshot', {
	captureBeyondViewport: false,
	format: 'png'
});

await writeFile(screenshotPath, Buffer.from(screenshot.data, 'base64'));
console.log(JSON.stringify({
	...evidence,
	pageState,
	screenshotPath
}, null, 2));
socket.close();

function sendCommand(method, params = {}) {
	commandId += 1;

	return new Promise((resolve, reject) => {
		pendingCommands.set(commandId, { reject, resolve });
		socket.send(JSON.stringify({ id: commandId, method, params }));
	});
}

function collectEvent(message) {
	if (message.method === 'Runtime.exceptionThrown') {
		evidence.exceptions.push(message.params.exceptionDetails.text);
	}

	if (message.method === 'Log.entryAdded' && message.params.entry.level === 'error') {
		evidence.consoleErrors.push(message.params.entry.text);
	}

	if (message.method === 'Network.loadingFailed') {
		evidence.failedRequests.push({
			errorText: message.params.errorText,
			type: message.params.type
		});
	}

	if (message.method === 'Network.responseReceived' && message.params.response.status >= 400) {
		evidence.httpErrors.push({
			status: message.params.response.status,
			url: message.params.response.url
		});
	}
}

async function evaluatePageState() {
	const evaluation = await sendCommand('Runtime.evaluate', {
		expression: `(() => {
			const renderer = globalThis.AwtsmoosMitzvahWorld?.runtime?.renderer;
			return {
				bodyText: document.body?.innerText?.slice(0, 800) || '',
				canvasCount: document.querySelectorAll('canvas').length,
				dataset: { ...document.documentElement.dataset },
				href: location.href,
				readyState: document.readyState,
				renderer: {
					backend: renderer?.backend || null,
					contextName: renderer?.contextName || null,
					errors: [...(renderer?.errors || [])],
					hydrationError: renderer?.hydrationError?.message || null,
					hydrationState: renderer?.hydrationState || null,
					stats: { ...(renderer?.stats || {}) }
				},
				title: document.title
			};
		})()`,
		returnByValue: true
	});

	return evaluation.result.value;
}

function wait(milliseconds) {
	return new Promise((resolve) => {
		setTimeout(resolve, milliseconds);
	});
}
