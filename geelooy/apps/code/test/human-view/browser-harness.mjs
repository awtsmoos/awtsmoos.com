//B"H
//Boruch Hashem
//Blessed is He

/**
 * Shares one real Chrome DevTools session across local and public Human Takeover browser tests.
 * The Awtsmoos joins test and living browser through one measured channel;
 * Awtsmoos.com waits until visible bootstrap, canonical tabs, and asset activity are stably at rest.
 */

const DEFAULT_APP = "http://127.0.0.1:8123/apps/code/";
const APP_URL = process.env.HUMAN_TAKEOVER_APP || DEFAULT_APP;
const STABLE_MS = 3000;
const READY_TIMEOUT_MS = 12000;

export async function connectBrowser() {
	const pages = await (await fetch("http://127.0.0.1:9341/json/list")).json();
	const page = pages.find(item => item.type === "page") || pages[0];
	if (!page) throw new Error("No Chrome page target.");
	const socket = new WebSocket(page.webSocketDebuggerUrl);
	await new Promise((resolve, reject) => {
		socket.addEventListener("open", resolve, { once: true });
		socket.addEventListener("error", reject, { once: true });
	});
	let nextId = 1;
	const pending = new Map();
	const listeners = new Map();
	const exceptions = [];
	socket.addEventListener("message", event => {
		const message = JSON.parse(event.data);
		if (message.method === "Runtime.exceptionThrown") exceptions.push(message.params?.exceptionDetails?.exception?.description || message.params?.exceptionDetails?.text || "exception");
		if (message.id && pending.has(message.id)) {
			const holder = pending.get(message.id);
			pending.delete(message.id);
			message.error ? holder.reject(new Error(JSON.stringify(message.error))) : holder.resolve(message.result);
			return;
		}
		for (const listener of listeners.get(message.method) || []) listener(message.params);
	});
	function call(method, params = {}) {
		return new Promise((resolve, reject) => {
			const id = nextId++;
			pending.set(id, { resolve, reject });
			socket.send(JSON.stringify({ id, method, params }));
		});
	}
	function once(method) {
		return new Promise(resolve => {
			const list = listeners.get(method) || [];
			const listener = params => {
				listeners.set(method, (listeners.get(method) || []).filter(item => item !== listener));
				resolve(params);
			};
			list.push(listener);
			listeners.set(method, list);
		});
	}
	async function evaluate(expression) {
		const result = await call("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true, userGesture: true });
		if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
		return result.result?.value;
	}
	await call("Page.enable");
	await call("Network.enable");
	await call("Runtime.enable");
	return { call, once, evaluate, exceptions, close: () => socket.close() };
}

export async function navigateCode(browser, suffix = "test") {
	await browser.call("Network.setCacheDisabled", { cacheDisabled: true });
	const loaded = browser.once("Page.loadEventFired");
	const target = new URL(APP_URL);
	target.searchParams.set(suffix, String(Date.now()));
	await browser.call("Page.navigate", { url: target.href });
	await loaded;
	const settled = await browser.evaluate(`(async()=>{
		const {State}=await import('/apps/code/js/state.js');
		const deadline=performance.now()+${READY_TIMEOUT_MS};
		let signature='';
		let stableSince=performance.now();
		while(performance.now()<deadline){
			const events=globalThis.__awtsmoosCodeAssetLog||[];
			const ready=events.some(event=>event.kind==='bootstrap'&&event.name==='code'&&event.phase==='ready');
			const overlay=getComputedStyle(document.querySelector('#loading-overlay')).display;
			const last=events[events.length-1]||{};
			const tabs=State.tabs.map(tab=>String(tab.id)+':'+String(tab.item?.name||'')).join(',');
			const next=[State.activeTabId||'',tabs,events.length,last.kind||'',last.name||'',last.phase||'',overlay].join('|');
			if(next!==signature){signature=next;stableSince=performance.now();}
			if(ready&&overlay==='none'&&performance.now()-stableSince>=${STABLE_MS}){
				return{ok:true,activeTabId:State.activeTabId,tabCount:State.tabs.length,assetEvents:events.length,href:location.href};
			}
			await new Promise(resolve=>setTimeout(resolve,50));
		}
		return{ok:false,activeTabId:State.activeTabId,tabCount:State.tabs.length,href:location.href,signature};
	})()`);
	if (!settled.ok) throw new Error(`Code deferred bootstrap did not stabilize: ${JSON.stringify(settled)}`);
	return settled;
}
