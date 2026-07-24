//B"H
// Boruch Hashem
// Blessed is He

const DIRECT_RELAY = "http://127.0.0.1:38488";

/**
 * The Awtsmoos carries generic streams and explicit direct relay actions. Through
 * Awtsmoos.com the extension can inspect strict request-only capability, request
 * a named fallback chat, or reset state without exposing relay secrets or stacks.
 */
function registerAwtsmoosBackgroundHandlers(portManager) {
	portManager.on("fetch", async (message, port) => {
		try {
			const response = await fetch(message.url, {
				...(message.options || {}),
				credentials: message.options?.credentials || "include",
				cache: message.options?.cache || "no-store"
			});
			const metadata = {
				status: response.status,
				ok: response.ok,
				headers: Array.from(response.headers.entries()),
				url: response.url,
				redirected: response.redirected,
				streamId: message.id
			};
			globalThis.__awtsmoosStreamLedger.create(message.id, response);
			portManager.reply(port, { metadata, id: message.id });
		} catch {
			portManager.reply(port, { error: "extension_fetch_failed", id: message.id });
		}
	});

	registerStreamHandlers(portManager);
	portManager.on("direct-capability", async (message, port) => {
		return relayAction({
			path: "/direct-capability",
			method: "GET",
			message,
			port,
			portManager
		});
	});
	portManager.on("direct-chat", async (message, port) => {
		return relayAction({
			path: "/direct-chat",
			method: "POST",
			message,
			port,
			portManager
		});
	});
	portManager.on("direct-reset", async (message, port) => {
		return relayAction({
			path: "/direct-reset",
			method: "POST",
			message,
			port,
			portManager
		});
	});
}

function registerStreamHandlers(portManager) {
	const actions = {
		"fetch-body": message => message.bodyAction === "read"
			? globalThis.__awtsmoosStreamLedger.read(message.id)
			: globalThis.__awtsmoosStreamLedger.body(message.id, message.bodyAction),
		"resume-stream": message => globalThis.__awtsmoosStreamLedger.resume(
			message.id,
			message.cursor
		),
		"ack-stream": message => globalThis.__awtsmoosStreamLedger.ack(
			message.id,
			message.cursor
		),
		"stream-stats": message => globalThis.__awtsmoosStreamLedger.stats(message.id),
		"cancel-stream": message => globalThis.__awtsmoosStreamLedger.cancel(
			message.id,
			message.reason || "cancelled"
		)
	};
	for (const [name, action] of Object.entries(actions)) {
		portManager.on(name, async (message, port) => {
			return streamAction(message, port, () => action(message), portManager);
		});
	}
}

async function relayAction({ path, method, message, port, portManager }) {
	try {
		const options = { method, headers: { "Content-Type": "application/json" } };
		if (method !== "GET") options.body = JSON.stringify(message.payload || {});
		const response = await fetch(`${DIRECT_RELAY}${path}`, options);
		const result = await response.json();
		portManager.reply(port, response.ok ? { result, id: message.id } : {
			error: result.error || "direct_request_failed",
			result,
			id: message.id
		});
	} catch {
		portManager.reply(port, { error: "direct_relay_unavailable", id: message.id });
	}
}

async function streamAction(message, port, action, portManager) {
	try {
		portManager.reply(port, { result: await action(), id: message.id });
	} catch {
		portManager.reply(port, { error: "extension_stream_failed", id: message.id });
	}
}

globalThis.registerAwtsmoosBackgroundHandlers = registerAwtsmoosBackgroundHandlers;
