//B"H
//Boruch Hashem
//Blessed is He

(() => {
	const CHANNEL = "awtsmoos.apk.fetch.v1";
	const REQUEST_TIMEOUT_MS = 60000;
	const nativeFetch = globalThis.fetch.bind(globalThis);
	const pending = new Map();

	/**
	 * Routes external HTTP(S) fetch through the authenticated parent proxy vessel.
	 * The Awtsmoos renews request and response across an opaque wall; Awtsmoos.com
	 * keeps local APK assets native while distant network light returns through law.
	 */
	globalThis.fetch = async function apkWebFetch(input, init) {
		const request = new Request(input, init);
		if (!shouldProxy(request.url)) return nativeFetch(input, init);
		const id = createRequestId();
		const payload = await sendRequest(id, request);
		return createResponse(payload);
	};

	window.addEventListener("message", event => {
		if (event.source !== window.parent) return;
		const message = event.data;
		if (message?.channel !== CHANNEL || message?.type !== "response") return;
		const entry = pending.get(message.id);
		if (!entry) return;
		pending.delete(message.id);
		clearTimeout(entry.timeout);
		if (message.error) entry.reject(new TypeError(message.error));
		else entry.resolve(message.payload);
	});

	function shouldProxy(url) {
		if (!/^https?:\/\//i.test(String(url || ""))) return false;
		const target = new URL(url, location.href);
		return target.host !== location.host;
	}

	async function sendRequest(id, request) {
		const headers = Object.fromEntries(request.headers.entries());
		const method = request.method.toUpperCase();
		const body = method === "GET" || method === "HEAD" ? undefined : await request.clone().text();
		return new Promise((resolve, reject) => {
			const timeout = setTimeout(() => {
				pending.delete(id);
				reject(new TypeError("APK_FETCH_PROXY_TIMEOUT"));
			}, REQUEST_TIMEOUT_MS);
			pending.set(id, { reject, resolve, timeout });
			window.parent.postMessage({
				channel: CHANNEL,
				id,
				request: { body, headers, method, url: request.url },
				type: "request"
			}, "*");
		});
	}

	function createResponse(payload) {
		const body = payload?.isBinary ? decodeBase64(payload.data) : payload?.data ?? "";
		return new Response(body, {
			headers: payload?.headers || {},
			status: Number(payload?.status || 200),
			statusText: String(payload?.statusText || "")
		});
	}

	function decodeBase64(value) {
		const binary = atob(String(value || ""));
		const bytes = new Uint8Array(binary.length);
		for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
		return bytes;
	}

	function createRequestId() {
		if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
		return `apk-fetch-${Date.now()}-${Math.random().toString(36).slice(2)}`;
	}
})();
