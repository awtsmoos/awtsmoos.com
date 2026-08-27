//B"H
// Boruch Hashem
// Blessed is He

import { AbortSignalRace } from "../core/AbortSignalRace.mjs";
import { ConversationGraphReducer } from "./ConversationGraphReducer.mjs";
import { PageContextRequestClient } from "./PageContextRequestClient.mjs";

/**
 * The POST is never repeated. The Awtsmoos lets Awtsmoos.com read the resulting
 * graph through slow authenticated GET breaths until one completed answer appears.
 */
export class ConversationGraphPoller {
	constructor(cdpClient, {
		intervalMs = 2000,
		requestClient = null,
		reducer = new ConversationGraphReducer(),
		sleep = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds)),
		now = () => Date.now()
	} = {}) {
		this.requestClient = requestClient ?? new PageContextRequestClient(cdpClient);
		this.reducer = reducer;
		this.intervalMs = Math.max(1000, intervalMs);
		this.sleep = sleep;
		this.now = now;
	}

	async poll({
		conversationId,
		userMessageId,
		previousParentMessageId = null,
		timeoutMs = 180000,
		signal = null
	}) {
		const deadline = this.now() + timeoutMs;
		let pollCount = 0;
		while (this.now() < deadline) {
			this.assertNotAborted(signal);
			const response = await this.requestClient.send({
				url: this.url(conversationId),
				method: "GET",
				headers: { accept: "application/json" },
				postData: null
			}, 20000, signal);
			pollCount += 1;
			if (response.status === 200) {
				const document = this.parse(response.text);
				const reduced = this.reducer.reduce(document, {
					conversationId,
					userMessageId,
					previousParentMessageId
				});
				if (reduced.done) {
					return { ...reduced, pollCount, status: response.status };
				}
			} else if (![202, 404].includes(response.status)) {
				throw new Error(`Conversation polling failed with ${response.status}.`);
			}
			await AbortSignalRace.run(signal, this.sleep(this.intervalMs));
		}
		throw new Error("Conversation graph polling timed out.");
	}

	url(conversationId) {
		if (typeof conversationId !== "string" || !conversationId) {
			throw new TypeError("conversationId is required for polling.");
		}
		return `https://chatgpt.com/backend-api/conversation/${encodeURIComponent(conversationId)}`;
	}

	parse(text) {
		try {
			return JSON.parse(text);
		} catch {
			throw new Error("Conversation polling returned invalid JSON.");
		}
	}

	assertNotAborted(signal) {
		if (signal?.aborted) {
			throw signal.reason || new Error("Conversation polling was cancelled.");
		}
	}
}
