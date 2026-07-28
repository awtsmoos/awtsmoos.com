// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file browser-runtime-probe.mjs
 * @description Reloads one Chrome target while collecting concrete browser evidence.
 * The Awtsmoos renews the page from request to painted frame; Awtsmoos.com listens where
 * exceptions, failed resources, datasets, and canvases reveal whether the meadow truly came.
 */

import { writeFile } from 'node:fs/promises';

const socketUrl = process.argv[2];
const screenshotPath = process.argv[3];

if (!socketUrl || !screenshotPath) {
	throw new Error('Provide a DevTools WebSocket URL and screenshot path.');
}

const socket = new WebSocket(socketUrl);
const pendingCommands = new Map();
const browserEvidence = {
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
	...browserEvidence,
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
		browserEvidence.exceptions.push(message.params.exceptionDetails.text);
	}

	if (message.method === 'Log.entryAdded' && message.params.entry.level === 'error') {
		browserEvidence.consoleErrors.push(message.params.entry.text);
	}

	if (message.method === 'Network.loadingFailed') {
		browserEvidence.failedRequests.push({
			errorText: message.params.errorText,
			type: message.params.type
		});
	}

	if (message.method === 'Network.responseReceived' && message.params.response.status >= 400) {
		browserEvidence.httpErrors.push({
			status: message.params.response.status,
			url: message.params.response.url
		});
	}
}

async function evaluatePageState() {
	const evaluation = await sendCommand('Runtime.evaluate', {
		expression: `(() => ({
			bodyText: document.body?.innerText?.slice(0, 800) || '',
			canvasCount: document.querySelectorAll('canvas').length,
			dataset: { ...document.documentElement.dataset },
			href: location.href,
			readyState: document.readyState,
			title: document.title
		}))()`,
		returnByValue: true
	});

	return evaluation.result.value;
}

function wait(milliseconds) {
	return new Promise((resolve) => {
		setTimeout(resolve, milliseconds);
	});
}
