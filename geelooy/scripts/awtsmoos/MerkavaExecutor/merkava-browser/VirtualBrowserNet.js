//B"H
//Boruch Hashem
//Blessed is He

(function(root, factory) {
	if (typeof module === "object" && module.exports) {
		module.exports = factory();
	} else {
		root.Merkava = root.Merkava || {};
		root.Merkava.VirtualBrowserNet = factory().VirtualBrowserNet;
	}
})(typeof self !== "undefined" ? self : this, function() {

function nodeRequire(name) {
	try { if (typeof require === "function") return require(name); } catch (e) {}
	return null;
}

/* ================================================================== */
/* 8. FAST FETCH — connection pooling + in-flight GET dedup            */
/*    Node's undici already keep-alives; we add: dedup of identical    */
/*    concurrent GETs (thundering-herd guard) and zero-copy cloning.   */
/* ================================================================== */

class VirtualFastFetch {
	constructor(options = {}) {
		this.options = options;
		this.__inflight = new Map();
		this.stats = { requests: 0, deduped: 0, bytesIn: 0 };
	}
	__key(input, init) {
		const url = typeof input === "string" ? input : (input && input.url) || String(input);
		return (init && init.method ? init.method.toUpperCase() : "GET") + " " + url;
	}
	async fetch(input, init = {}) {
		const method = (init.method || (input && input.method) || "GET").toUpperCase();
		const url = typeof input === "string" ? input : (input && input.url) || String(input);
		this.stats.requests++;
		if (method === "GET" && !init.body) {
			const key = this.__key(input, init);
			const existing = this.__inflight.get(key);
			if (existing) {
				this.stats.deduped++;
				const res = await existing;
				return res.clone();
			}
			const p = globalThis.fetch(url, init).then(async res => {
				this.__inflight.delete(key);
				// Tee the body so the cached promise can be cloned cheaply later
				const buf = await res.arrayBuffer();
				this.stats.bytesIn += buf.byteLength;
				const headers = {};
				res.headers.forEach((v, k) => { headers[k] = v; });
				return new Response(buf, { status: res.status, statusText: res.statusText, headers });
			}).catch(err => {
				this.__inflight.delete(key);
				throw err;
			});
			this.__inflight.set(key, p);
			return p;
		}
		const res = await globalThis.fetch(input, init);
		return res;
	}
}

/* ================================================================== */
/* 9. PARALLEL WORKER — true OS-thread parallelism via worker_threads */
/* ================================================================== */

const WORKER_SHIM = `
const { parentPort } = require('worker_threads');
globalThis.__merkavaPorts = [];
globalThis.postMessage = function(data, transfer) {
	parentPort.postMessage(data, transfer);
};
globalThis.onmessage = null;
Object.defineProperty(globalThis, 'onmessage', {
	get() { return globalThis.__onmessage || null; },
	set(fn) { globalThis.__onmessage = fn; }
});
// B"H: worker errors must reach the host's onerror (Web Worker semantics).
// An uncaught throw in the user handler is reported back as an error event
// instead of being swallowed — the worker stays alive like in browsers.
parentPort.on('message', (data) => {
	try { globalThis.__onmessage && globalThis.__onmessage({ data }); }
	catch (e) {
		parentPort.postMessage({ __merkavaWorkerError: String((e && e.message) || e), __merkavaWorkerStack: (e && e.stack) || "" });
	}
});
parentPort.on('close', () => {});
`;
function isWorkerErrorEvent(data) {
	return data !== null && typeof data === "object" && typeof data.__merkavaWorkerError === "string";
}
function workerErrorFrom(data) {
	const err = new Error(data.__merkavaWorkerError);
	err.stack = data.__merkavaWorkerStack || err.stack;
	err.__isWorkerError = true;
	return err;
}

class VirtualParallelWorker {
	constructor(source, options = {}) {
		const wt = nodeRequire("worker_threads");
		if (!wt) throw new Error("ParallelWorker requires Node worker_threads");
		this.__listeners = { message: [], error: [] };
		this.onmessage = null;
		this.onerror = null;
		this.__terminated = false;
		let code = String(source || "");
		// Blob:/data: URLs — extract the code
		const dataMatch = code.match(/^data:(?:[^,]*),([\s\S]*)$/);
		if (dataMatch) {
			try { code = decodeURIComponent(dataMatch[1]); } catch (e) { code = dataMatch[1]; }
		} else if (/^blob:/.test(code)) {
			throw new Error("ParallelWorker: blob: URLs need host resolution");
		}
		const fullCode = WORKER_SHIM + "\n" + code;
		this.__worker = new wt.Worker(fullCode, { eval: true });
		this.__worker.on("message", (data) => {
			// Route worker-reported errors to error listeners, not message listeners.
			if (isWorkerErrorEvent(data)) {
				this.__dispatchWorkerError(workerErrorFrom(data));
				return;
			}
			const ev = { data, target: this, type: "message" };
			try { this.onmessage && this.onmessage(ev); } catch (e) {}
			for (const fn of this.__listeners.message) { try { fn(ev); } catch (e) {} }
		});
		this.__worker.on("error", (err) => {
			this.__dispatchWorkerError(err);
		});
		// B"H: queue posts until the thread is online — posting before the
		// worker attaches its parentPort listener would silently drop messages.
		// The flush is race-safe: postMessage re-checks __online after pushing,
		// so an 'online' event landing between check and push cannot lose mail.
		this.__online = false;
		this.__preOnline = [];
		this.__worker.once("online", () => {
			this.__online = true;
			this.__flushPreOnline();
		});
		// B"H: no unref() — a live worker keeps the event loop alive like a
		// real Web Worker keeps its owner alive. terminate() releases it.
	}
	__flushPreOnline() {
		const q = this.__preOnline;
		this.__preOnline = [];
		for (const [d, t] of q) { if (!this.__terminated) this.__worker.postMessage(d, t); }
	}
	__dispatchWorkerError(err) {
		const ev = { error: err, target: this, type: "error", message: String(err && err.message || err) };
		try { this.onerror && this.onerror(ev); } catch (e) {}
		for (const fn of this.__listeners.error) { try { fn(ev); } catch (e) {} }
	}
	get ready() { return this.__online ? Promise.resolve() : new Promise((res) => this.__worker.once("online", res)); }
	postMessage(data, transfer) {
		if (this.__terminated) return;
		if (this.__online) { this.__worker.postMessage(data, transfer); return; }
		this.__preOnline.push([data, transfer]);
		if (this.__online) this.__flushPreOnline();
	}
	terminate() {
		this.__terminated = true;
		this.__worker.terminate();
	}
	addEventListener(type, fn) { if (fn) (this.__listeners[type] = this.__listeners[type] || []).push(fn); }
	removeEventListener(type, fn) { this.__listeners[type] = (this.__listeners[type] || []).filter(x => x !== fn); }
	get terminated() { return this.__terminated; }
}

/* ================================================================== */
/* 10. WEBSOCKET — full duplex over Node's WHATWG WebSocket            */
/* ================================================================== */

class VirtualWebSocket {
	constructor(url, protocols) {
		this.url = String(url);
		this.protocol = "";
		this.readyState = VirtualWebSocket.CONNECTING;
		this.binaryType = "blob";
		this.bufferedAmount = 0;
		this.onopen = null; this.onmessage = null; this.onerror = null; this.onclose = null;
		this.__listeners = {};
		this.__stats = { sent: 0, received: 0, bytesIn: 0, bytesOut: 0 };
		this.__queue = [];
		const WS = globalThis.WebSocket;
		if (typeof WS !== "function") {
			queueMicrotask(() => this.__fail(new Error("WebSocket not available in this host")));
			return;
		}
		try {
			this.__ws = protocols !== undefined ? new WS(this.url, protocols) : new WS(this.url);
		} catch (e) {
			queueMicrotask(() => this.__fail(e));
			return;
		}
		if (protocols !== undefined) this.protocol = this.__ws.protocol || "";
		this.__ws.binaryType = "arraybuffer";
		this.__ws.onopen = (e) => {
			this.readyState = VirtualWebSocket.OPEN;
			for (const d of this.__queue) this.__sendNow(d);
			this.__queue.length = 0;
			this.__emit("open", { target: this, type: "open" });
		};
		this.__ws.onmessage = (e) => {
			this.__stats.received++;
			let data = e.data;
			if (typeof data !== "string") {
				const buf = data instanceof ArrayBuffer ? data : data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
				this.__stats.bytesIn += buf.byteLength;
				if (this.binaryType === "arraybuffer") data = buf;
				else data = new Blob([buf]);
			} else {
				this.__stats.bytesIn += data.length;
			}
			this.__emit("message", { data, target: this, type: "message", origin: this.url });
		};
		this.__ws.onerror = (e) => this.__emit("error", { target: this, type: "error", error: e });
		this.__ws.onclose = (e) => {
			this.readyState = VirtualWebSocket.CLOSED;
			this.__emit("close", { target: this, type: "close", code: e.code, reason: e.reason, wasClean: e.wasClean });
		};
	}
	__emit(type, ev) {
		const h = this["on" + type];
		try { h && h(ev); } catch (e) {}
		for (const fn of (this.__listeners[type] || [])) { try { fn(ev); } catch (e) {} }
	}
	__fail(e) {
		this.readyState = VirtualWebSocket.CLOSED;
		this.__emit("error", { target: this, type: "error", error: e });
		this.__emit("close", { target: this, type: "close", code: 1006, reason: String(e && e.message || e), wasClean: false });
	}
	__sendNow(data) {
		this.__stats.sent++;
		if (typeof data === "string") this.__stats.bytesOut += data.length;
		else if (data) this.__stats.bytesOut += data.byteLength || data.length || 0;
		this.__ws.send(data);
	}
	send(data) {
		if (this.readyState === VirtualWebSocket.CONNECTING) { this.__queue.push(data); this.bufferedAmount += 1; return; }
		if (this.readyState !== VirtualWebSocket.OPEN) throw new Error("InvalidStateError: WebSocket not open");
		this.__sendNow(data);
	}
	close(code = 1000, reason = "") {
		if (this.__ws) { try { this.__ws.close(code, reason); } catch (e) {} }
		else this.readyState = VirtualWebSocket.CLOSED;
	}
	addEventListener(type, fn) { if (fn) (this.__listeners[type] = this.__listeners[type] || []).push(fn); }
	removeEventListener(type, fn) { this.__listeners[type] = (this.__listeners[type] || []).filter(x => x !== fn); }
	get stats() { return { ...this.__stats }; }
}
VirtualWebSocket.CONNECTING = 0;
VirtualWebSocket.OPEN = 1;
VirtualWebSocket.CLOSING = 2;
VirtualWebSocket.CLOSED = 3;

/* ================================================================== */
/* INSTALLER                                                           */
/* ================================================================== */

function installVirtualBrowserNet(windowObject, options = {}) {
	const fastFetch = new VirtualFastFetch(options);
	// Additive: fetchFast joins fetch; original virtual fetch stays untouched.
	windowObject.fetchFast = (input, init) => fastFetch.fetch(input, init);
	windowObject.__fastFetchStats = () => ({ ...fastFetch.stats });
	windowObject.ParallelWorker = VirtualParallelWorker;
	windowObject.WebSocket = windowObject.WebSocket || VirtualWebSocket;
	return { fastFetch, VirtualFastFetch, VirtualParallelWorker, VirtualWebSocket };
}

return {
	VirtualBrowserNet: {
		installVirtualBrowserNet,
		VirtualFastFetch,
		VirtualParallelWorker,
		VirtualWebSocket
	},
	installVirtualBrowserNet,
	VirtualFastFetch,
	VirtualParallelWorker,
	VirtualWebSocket
};

});
