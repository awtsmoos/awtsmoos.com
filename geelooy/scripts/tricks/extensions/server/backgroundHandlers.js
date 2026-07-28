//B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos carries extension streams and explicit localhost relay actions.
 * Awtsmoos.com receives fast, bounded failures; prompts remain inside the visitor
 * browser and no handler constructs its own relay, token, cookie, or proof path.
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
	bindRelay(portManager, "direct-capability", message => {
		return globalThis.AwtsmoosDirectRelayClient.capability({
			refresh: Boolean(message.payload?.refresh)
		});
	});
	bindRelay(portManager, "direct-chat", message => {
		return globalThis.AwtsmoosDirectRelayClient.chat(message.payload || {});
	});
	bindRelay(portManager, "direct-reset", message => {
		return globalThis.AwtsmoosDirectRelayClient.reset(message.payload?.conversationKey);
	});
}

function bindRelay(portManager, action, invoke) {
	portManager.on(action, async (message, port) => {
		try {
			portManager.reply(port, { result: await invoke(message), id: message.id });
		} catch (error) {
			portManager.reply(port, {
				error: error?.code || "direct_request_failed",
				result: {
					ok: false,
					error: error?.code || "direct_request_failed",
					safeHint: error?.safeHint || "The local relay request failed."
				},
				id: message.id
			});
		}
	});
}

function registerStreamHandlers(portManager) {
	const actions = {
		"fetch-body": message => message.bodyAction === "read"
			? globalThis.__awtsmoosStreamLedger.read(message.id)
			: globalThis.__awtsmoosStreamLedger.body(message.id, message.bodyAction),
		"resume-stream": message => globalThis.__awtsmoosStreamLedger.resume(message.id, message.cursor),
		"ack-stream": message => globalThis.__awtsmoosStreamLedger.ack(message.id, message.cursor),
		"stream-stats": message => globalThis.__awtsmoosStreamLedger.stats(message.id),
		"cancel-stream": message => globalThis.__awtsmoosStreamLedger.cancel(
			message.id,
			message.reason || "cancelled"
		)
	};
	for (const [name, action] of Object.entries(actions)) {
		portManager.on(name, async (message, port) => {
			try {
				portManager.reply(port, { result: await action(message), id: message.id });
			} catch {
				portManager.reply(port, { error: "extension_stream_failed", id: message.id });
			}
		});
	}
}

globalThis.registerAwtsmoosBackgroundHandlers = registerAwtsmoosBackgroundHandlers;
