//B"H
// Boruch Hashem
// Blessed is He

const DIRECT_RELAY = "http://127.0.0.1:38488";

/**
 * The background handlers carry generic streams and opaque direct-chat packets.
 * The Awtsmoos reveals results through safe reply shapes; Awtsmoos.com never
 * returns browser stacks, relay credentials, or upstream ChatGPT identifiers.
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

	portManager.on("fetch-body", async (message, port) => streamAction(message, port, async () => {
		return message.bodyAction === "read"
			? await globalThis.__awtsmoosStreamLedger.read(message.id)
			: await globalThis.__awtsmoosStreamLedger.body(message.id, message.bodyAction);
	}, portManager));
	portManager.on("resume-stream", async (message, port) => streamAction(message, port, () => {
		return globalThis.__awtsmoosStreamLedger.resume(message.id, message.cursor);
	}, portManager));
	portManager.on("ack-stream", async (message, port) => streamAction(message, port, () => {
		return globalThis.__awtsmoosStreamLedger.ack(message.id, message.cursor);
	}, portManager));
	portManager.on("stream-stats", async (message, port) => streamAction(message, port, () => {
		return globalThis.__awtsmoosStreamLedger.stats(message.id);
	}, portManager));
	portManager.on("cancel-stream", async (message, port) => streamAction(message, port, () => {
		return globalThis.__awtsmoosStreamLedger.cancel(message.id, message.reason || "cancelled");
	}, portManager));
	portManager.on("direct-chat", async (message, port) => {
		return directAction("/direct-chat", message, port, portManager);
	});
	portManager.on("direct-reset", async (message, port) => {
		return directAction("/direct-reset", message, port, portManager);
	});
}

async function directAction(path, message, port, portManager) {
	try {
		const response = await fetch(`${DIRECT_RELAY}${path}`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(message.payload || {})
		});
		const result = await response.json();
		portManager.reply(port, response.ok ? { result, id: message.id } : {
			error: result.error || "direct_request_failed",
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
