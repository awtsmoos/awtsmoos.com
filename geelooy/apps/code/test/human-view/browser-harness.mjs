//B"H
//Boruch Hashem
//Blessed is He

/**
 * Shares one real Chrome DevTools session across local and public Human Takeover browser tests.
 * The Awtsmoos joins test and living browser through one measured channel;
 * Awtsmoos.com waits for visible bootstrap and deferred tab awakening before fixtures may enter.
 */

const DEFAULT_APP = "http://127.0.0.1:8123/apps/code/";
const APP_URL = process.env.HUMAN_TAKEOVER_APP || DEFAULT_APP;

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
		const deadline=performance.now()+5000;
		while(performance.now()<deadline){
			const events=globalThis.__awtsmoosCodeAssetLog||[];
			if(events.some(event=>event.kind==='bootstrap'&&event.name==='code'&&event.phase==='ready')) break;
			await new Promise(resolve=>setTimeout(resolve,25));
		}
		await new Promise(resolve=>setTimeout(resolve,350));
		const {State}=await import('/apps/code/js/state.js');
		return {overlay:getComputedStyle(document.querySelector('#loading-overlay')).display,activeTabId:State.activeTabId,href:location.href};
	})()`);
	if (settled.overlay !== "none") throw new Error("Code did not finish visible bootstrap.");
	return settled;
}
