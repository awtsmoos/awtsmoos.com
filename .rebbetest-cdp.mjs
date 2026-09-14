//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module RebbeCdpSmoke
 * @description
 * Minimal Chrome DevTools Protocol smoke gate with zero browser libraries. It
 * opens the exact Rebbe route, drives mobile year/folder/track navigation and
 * the visible Search Scan button, and records browser/runtime failures.
 * The Awtsmoos is one beyond protocol and page; this finite vessel proves the
 * living public interaction path before release is called complete.
 */

const chromeBase = process.env.CHROME_URL || 'http://127.0.0.1:9333';
const rebbeUrl = process.env.REBBE_URL || 'http://127.0.0.1:8765/apps/rebbe/';
const targetResponse = await fetch(`${chromeBase}/json/new?${encodeURIComponent('about:blank')}`, {
	method: 'PUT'
});
if (!targetResponse.ok) throw new Error(`CDP target create failed: ${targetResponse.status}`);
const target = await targetResponse.json();
const socket = new WebSocket(target.webSocketDebuggerUrl);
const pending = new Map();
const runtimeErrors = [];
const networkFailures = [];
let nextId = 1;

await new Promise((resolve, reject) => {
	socket.addEventListener('open', resolve, { once: true });
	socket.addEventListener('error', reject, { once: true });
});

socket.addEventListener('message', event => {
	const message = JSON.parse(event.data);
	if (message.id && pending.has(message.id)) {
		const settle = pending.get(message.id);
		pending.delete(message.id);
		return message.error ? settle.reject(new Error(message.error.message)) : settle.resolve(message.result);
	}
	if (message.method === 'Runtime.exceptionThrown') {
		runtimeErrors.push(message.params?.exceptionDetails?.text || 'Runtime exception');
	}
	if (message.method === 'Network.loadingFailed') {
		networkFailures.push(`${message.params?.errorText || 'failed'} ${message.params?.requestId || ''}`);
	}
});

/** Sends one bounded CDP command and resolves its result. */
function command(method, params = {}) {
	const id = nextId++;
	return new Promise((resolve, reject) => {
		const timer = setTimeout(() => {
			pending.delete(id);
			reject(new Error(`CDP timeout: ${method}`));
		}, 15000);
		pending.set(id, {
			resolve: value => { clearTimeout(timer); resolve(value); },
			reject: error => { clearTimeout(timer); reject(error); }
		});
		socket.send(JSON.stringify({ id, method, params }));
	});
}

/** Evaluates JavaScript in the page and returns the JSON-safe value. */
async function evaluate(expression) {
	const result = await command('Runtime.evaluate', {
		expression,
		awaitPromise: true,
		returnByValue: true
	});
	if (result.exceptionDetails) throw new Error(result.exceptionDetails.text || 'Evaluation failed');
	return result.result?.value;
}

/** Polls an expression until it returns truthy or the gate expires. */
async function waitUntil(expression, timeout = 20000) {
	const deadline = Date.now() + timeout;
	while (Date.now() < deadline) {
		if (await evaluate(expression)) return true;
		await new Promise(resolve => setTimeout(resolve, 200));
	}
	throw new Error(`Wait expired: ${expression}`);
}

await command('Page.enable');
await command('Runtime.enable');
await command('Network.enable');
await command('Emulation.setDeviceMetricsOverride', {
	width: 412,
	height: 915,
	deviceScaleFactor: 1,
	mobile: true
});
await command('Page.navigate', { url: rebbeUrl });
console.log('STEP years');
await waitUntil(`document.querySelectorAll('#list-years .year-item').length > 0`);
const years = await evaluate(`document.querySelectorAll('#list-years .year-item').length`);
await evaluate(`[...document.querySelectorAll('#list-years .year-item')].find(node => node.textContent.includes('5737')).click()`);
console.log('STEP folders');
await waitUntil(`document.querySelectorAll('#list-folders .folder-item').length > 0`);
const folders = await evaluate(`document.querySelectorAll('#list-folders .folder-item').length`);
await evaluate(`document.querySelector('#list-folders .folder-item .folder-label').click()`);
console.log('STEP tracks');
await waitUntil(`document.querySelectorAll('#list-tracks .track-item').length > 0`);
const tracks = await evaluate(`document.querySelectorAll('#list-tracks .track-item').length`);
await evaluate(`document.querySelector('#btn-search').click()`);
await waitUntil(`document.querySelector('#modal-search:not(.hidden) #btn-date-search') !== null`);
await evaluate(`document.querySelector('#search-year-exact').value = '5737'`);
await evaluate(`document.querySelector('#btn-date-search').click()`);
console.log('STEP results');
await waitUntil(`document.querySelectorAll('#search-results-content .date-result').length > 0`, 30000);
const results = await evaluate(`document.querySelectorAll('#search-results-content .date-result').length`);
console.log(JSON.stringify({ years, folders, tracks, results, runtimeErrors, networkFailures }, null, 2));
await fetch(`${chromeBase}/json/close/${target.id}`);
socket.close();
if (!years || !folders || !tracks || !results || runtimeErrors.length) process.exitCode = 1;
