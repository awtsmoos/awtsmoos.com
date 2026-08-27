// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file browserProofClient.mjs
 * @description Proves measured essentials, deferred richness, minimap, network health, and movement.
 */

const endpoint = 'http://127.0.0.1:9364';
const target = (await fetch(`${endpoint}/json/list`).then(value => value.json()))
	.find(value => value.type === 'page');
if (!target?.webSocketDebuggerUrl) throw new Error('BROWSER_TARGET_MISSING');
const socket = new WebSocket(target.webSocketDebuggerUrl);
const pending = new Map();
const evidence = { console: [], exceptions: [], failed: [], http: [], urls: [] };
let sequence = 0;
await new Promise((resolve, reject) => {
	socket.addEventListener('open', resolve, { once: true });
	socket.addEventListener('error', reject, { once: true });
	socket.addEventListener('message', event => receive(JSON.parse(event.data)));
});

function receive(message) {
	if (message.id) {
		const item = pending.get(message.id);
		if (!item) return;
		pending.delete(message.id);
		clearTimeout(item.timer);
		message.error ? item.reject(message.error) : item.resolve(message.result);
		return;
	}
	const value = message.params || {};
	if (message.method === 'Network.requestWillBeSent') evidence.urls.push(value.request?.url || '');
	if (message.method === 'Network.loadingFailed') evidence.failed.push(value.errorText);
	if (message.method === 'Network.responseReceived' && value.response?.status >= 400) {
		evidence.http.push({ status: value.response.status, url: value.response.url });
	}
	if (message.method === 'Runtime.exceptionThrown') {
		evidence.exceptions.push(value.exceptionDetails?.exception?.description || value.exceptionDetails?.text);
	}
	if (message.method === 'Runtime.consoleAPICalled') {
		evidence.console.push({
			text: (value.args || []).map(item => item.value ?? item.description ?? item.type).join(' '),
			type: value.type
		});
	}
}

function send(method, params = {}, timeoutMs = 60000) {
	sequence += 1;
	const id = sequence;
	return new Promise((resolve, reject) => {
		const timer = setTimeout(() => {
			pending.delete(id);
			reject(new Error(`CDP_TIMEOUT:${method}`));
		}, timeoutMs);
		pending.set(id, { reject, resolve, timer });
		socket.send(JSON.stringify({ id, method, params }));
	});
}

await Promise.all([
	send('Page.enable'),
	send('Runtime.enable'),
	send('Network.enable'),
	send('Network.setCacheDisabled', { cacheDisabled: true })
]);
const startedAt = Date.now();
await send('Page.navigate', {
	url: `http://127.0.0.1:8364/games/mitzvahWorld/index.html?massive=${startedAt}`
});
let snapshot = null;
while (Date.now() - startedAt < 90000) {
	await delay(500);
	snapshot = await evaluate(snapshotExpression()).catch(() => null);
	if (snapshot?.state === 'playable' || snapshot?.state === 'failed') break;
}
if (snapshot?.state !== 'playable' || !snapshot?.position) {
	throw new Error(`NOT_PLAYABLE:${JSON.stringify(snapshot)}`);
}
const before = snapshot.position;
await send('Input.dispatchKeyEvent', keyEvent('keyDown'));
await delay(1400);
await send('Input.dispatchKeyEvent', keyEvent('keyUp'));
await delay(250);
const after = await evaluate(`(() => { const p=globalThis.AwtsmoosMitzvahWorld?.runtime?.model?.position; return p?{x:p.x,y:p.y,z:p.z}:null; })()`);
const distance = after ? Math.hypot(after.x - before.x, after.y - before.y, after.z - before.z) : 0;
const schedulerRequests = evidence.urls.filter(url => url.includes('MinimalMeadowFeatureScheduler.js'));
const richRequests = evidence.urls.filter(url => url.includes('MinimalMeadowFeatureBundle.js'));
const fatalConsole = evidence.console.filter(item => item.type === 'error' || /NOT_PLAYABLE|Uncaught|timed out/i.test(item.text));
const result = {
	BH: 'B"H', elapsedMs: Date.now() - startedAt, snapshot,
	movement: { after, before, distance, moved: distance > 0.001 },
	requests: { count: evidence.urls.length, richRequests, schedulerRequests },
	errors: { exceptions: evidence.exceptions, failed: evidence.failed, fatalConsole, http: evidence.http }
};
console.log(JSON.stringify(result, null, 2));
const systemsReady = Object.values(snapshot.systems).every(Boolean);
if (!systemsReady || !snapshot.timelineStages.includes('essential-ready')) process.exitCode = 2;
if (!distance || schedulerRequests.length || !richRequests.length) process.exitCode = 3;
if (snapshot.minimapCount < 1) process.exitCode = 5;
if (evidence.failed.length || evidence.http.length || evidence.exceptions.length || fatalConsole.length) process.exitCode = 4;
socket.close();

async function evaluate(expression) {
	const value = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
	return value.result?.value ?? null;
}
function delay(milliseconds) { return new Promise(resolve => setTimeout(resolve, milliseconds)); }
function keyEvent(type) { return { type, key: 'w', code: 'KeyW', windowsVirtualKeyCode: 87, nativeVirtualKeyCode: 87 }; }
function snapshotExpression() {
	return `(() => { const root=document.documentElement; const d=globalThis.AwtsmoosMitzvahWorld; const r=d?.runtime; const p=r?.model?.position; const timeline=r?.bootTimeline?.snapshot?.()||[]; return { state:root?.dataset?.awtsmoosRuntimeState||null, featureStage:r?.featureStage||null, richFeatureStage:r?.richFeatureStage||null, featureReady:r?.featureReceipt?.ready===true, timeline, timelineStages:timeline.map(v=>v.stage), systems:{inventory:Boolean(r?.inventoryStore),equipment:Boolean(r?.equipment),combat:Boolean(r?.combat),quest:Boolean(r?.questStore),recovery:Boolean(r?.recovery),streaming:Boolean(r?.expansion?.streaming)}, minimapCount:document.querySelectorAll('[data-world-minimap="true"]').length, position:p?{x:p.x,y:p.y,z:p.z}:null }; })()`;
}
