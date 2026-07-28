// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file browser-current-state-probe.mjs
 * @description Attaches without reload and records settled runtime, mount, and resource evidence.
 * The Awtsmoos lets the already-living page speak after its optional garments have had time;
 * Awtsmoos.com names each quiet failure without erasing playable core or restarting the climb.
 */

const debugPort = Number(process.argv[2] || 9240);
const requestedUrl = process.argv[3]
	|| 'http://localhost:8080/games/mitzvahWorld/';
const waitMilliseconds = Number(process.argv[4] || 5000);
const targets = await fetch(`http://127.0.0.1:${debugPort}/json/list`)
	.then((response) => response.json());
const target = targets.find((candidate) => candidate.url === requestedUrl)
	|| targets.find((candidate) => candidate.type === 'page');

if (!target?.webSocketDebuggerUrl) {
	throw new Error(`No page target exists for ${requestedUrl}`);
}

const socket = new WebSocket(target.webSocketDebuggerUrl);
const pending = new Map();
let commandId = 0;

socket.addEventListener('message', (event) => {
	const message = JSON.parse(event.data);
	if (!message.id || !pending.has(message.id)) {
		return;
	}
	const command = pending.get(message.id);
	pending.delete(message.id);
	message.error ? command.reject(message.error) : command.resolve(message.result);
});

await new Promise((resolve, reject) => {
	socket.addEventListener('open', resolve, { once: true });
	socket.addEventListener('error', reject, { once: true });
});
await send('Runtime.enable');
await wait(waitMilliseconds);
const evaluation = await send('Runtime.evaluate', {
	expression: `(() => {
		const diagnostics = globalThis.AwtsmoosMitzvahWorld;
		const runtime = diagnostics?.runtime;
		const resources = performance.getEntriesByType('resource').map((entry) => ({
			duration: Math.round(entry.duration),
			initiatorType: entry.initiatorType,
			name: entry.name,
			responseEnd: Math.round(entry.responseEnd),
			transferSize: entry.transferSize
		}));
		return {
			dataset: { ...document.documentElement.dataset },
			featureStatus: runtime?.featureStatus || null,
			mountStatus: runtime?.richWorldMountStatus || null,
			richWorldFailures: runtime?.richWorldFailures || null,
			resources,
			runtimePresent: Boolean(runtime),
			session: document.documentElement.dataset.awtsmoosSession || null
		};
	})()`,
	returnByValue: true
});
console.log(JSON.stringify(evaluation.result.value, null, 2));
socket.close();

function send(method, params = {}) {
	commandId += 1;
	return new Promise((resolve, reject) => {
		pending.set(commandId, { reject, resolve });
		socket.send(JSON.stringify({ id: commandId, method, params }));
	});
}

function wait(milliseconds) {
	return new Promise((resolve) => setTimeout(resolve, milliseconds));
}
