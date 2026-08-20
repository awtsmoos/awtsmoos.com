//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Yesod HTTP gateway for all browser-side Tunnel Control requests.
 * @description
 * The Awtsmoos renews request and response while Awtsmoos.com keeps timeout, cancellation, parsing, identity headers, and HTTP truth in one bridge;
 * real Response objects and lightweight legacy fetch vessels both enter the same testimony without letting an HTTP failure masquerade as success.
 */

export async function tunnelJsonRequest(url, options = {}) {
	const requestId = options.requestId || createRequestId();
	const controller = new AbortController();
	const detachExternal = bindExternalAbort(options.signal, controller);
	const timeoutId = startTimeout(controller, options.timeoutMs);
	try {
		const response = await (options.fetchImpl || globalThis.fetch)(url, {
			method: options.method || "GET",
			credentials: "include",
			headers: requestHeaders(options),
			body: requestBody(options.body),
			signal: controller.signal
		});
		return await normalizedResponse(response, requestId);
	} catch (error) {
		return transportFailure(error, requestId, controller.signal, options.signal);
	} finally {
		globalThis.clearTimeout(timeoutId);
		detachExternal();
	}
}

function requestHeaders(options) {
	const headers = new Headers(options.headers || {});
	headers.set("Accept", "application/json");
	if (options.body !== undefined) headers.set("Content-Type", "application/json");
	if (options.apiKey) headers.set("x-awtsmoos-api-key", String(options.apiKey));
	return headers;
}

function requestBody(body) {
	return body === undefined ? undefined : JSON.stringify(body);
}

async function normalizedResponse(response, requestId) {
	const parsed = await responsePayload(response);
	const httpOk = response?.ok !== false;
	const httpStatus = Number(response?.status || (httpOk ? 200 : 0));
	return {
		...parsed,
		ok: httpOk && parsed.ok !== false,
		httpStatus,
		httpOk,
		requestId
	};
}

async function responsePayload(response) {
	if (typeof response?.text === "function") {
		return parseResponseText(await response.text());
	}
	if (typeof response?.json === "function") {
		const parsed = await response.json();
		return parsed && typeof parsed === "object" ? parsed : {};
	}
	return { ok: false, error: "invalid_response_body", message: "Response body is unreadable." };
}

function parseResponseText(text) {
	if (!text) return {};
	try {
		return JSON.parse(text);
	} catch {
		return { ok: false, error: "invalid_json_response", message: text.slice(0, 240) };
	}
}

function transportFailure(error, requestId, signal, externalSignal) {
	const aborted = signal.aborted;
	const externalAbort = Boolean(externalSignal?.aborted);
	return {
		ok: false,
		error: externalAbort ? "request_aborted" : aborted ? "request_timeout" : "network_error",
		message: externalAbort ? "Request cancelled." : aborted ? "Request timed out." : error?.message || "Network request failed.",
		aborted: externalAbort,
		timeout: aborted && !externalAbort,
		networkError: !aborted,
		retryable: !externalAbort,
		httpStatus: 0,
		httpOk: false,
		requestId
	};
}

function startTimeout(controller, timeoutMs) {
	return globalThis.setTimeout(
		() => controller.abort("timeout"),
		Math.max(1000, Number(timeoutMs || 30000))
	);
}

function bindExternalAbort(signal, controller) {
	if (!signal) return () => {};
	const abort = () => controller.abort(signal.reason || "cancelled");
	if (signal.aborted) abort();
	else signal.addEventListener("abort", abort, { once: true });
	return () => signal.removeEventListener?.("abort", abort);
}

function createRequestId() {
	return globalThis.crypto?.randomUUID?.()
		|| `tunnel-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
