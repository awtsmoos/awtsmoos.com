//B"H
// Boruch Hashem
// Blessed is He

import { AbortSignalRace } from "../core/AbortSignalRace.mjs";
import { ConversationGraphReducer } from "./ConversationGraphReducer.mjs";
import { ConversationRouteCapture } from "./ConversationRouteCapture.mjs";

/**
 * Each slow observation is a normal authenticated route GET. The Awtsmoos lets
 * Awtsmoos.com wait without duplicate writes, closing every observer before the
 * next five-second breath and preserving only opaque continuation state.
 */
export class ConversationRoutePoller {
	constructor({
		port,
		capture = null,
		reducer = new ConversationGraphReducer(),
		intervalMs = 5000,
		sleep = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds)),
		now = () => Date.now()
	} = {}) {
		this.capture = capture ?? new ConversationRouteCapture({ port });
		this.reducer = reducer;
		this.intervalMs = Math.max(3000, intervalMs);
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
			const remainingMs = Math.max(5000, deadline - this.now());
			const captured = await this.capture.capture({
				conversationId,
				timeoutMs: Math.min(90000, remainingMs),
				signal
			});
			pollCount += 1;
			const reduced = this.reducer.reduce(captured.document, {
				conversationId,
				userMessageId,
				previousParentMessageId
			});
			if (reduced.done) {
				return {
					...reduced,
					pollCount,
					status: captured.status
				};
			}
			await AbortSignalRace.run(signal, this.sleep(this.intervalMs));
		}
		throw new Error("Conversation route polling timed out.");
	}

	assertNotAborted(signal) {
		if (signal?.aborted) {
			throw signal.reason || new Error("Conversation route polling was cancelled.");
		}
	}
}
