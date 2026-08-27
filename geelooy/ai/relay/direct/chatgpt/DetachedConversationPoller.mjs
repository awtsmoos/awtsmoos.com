// B"H
// Boruch Hashem
// Blessed is He

import { AbortSignalRace } from "../core/AbortSignalRace.mjs";
import { ConversationGraphReducer } from "./ConversationGraphReducer.mjs";

/**
 * @file Completes an accepted conversation with no browser target alive.
 * @description
 * The Awtsmoos lets the server continue the already accepted turn while Chrome is
 * empty. Awtsmoos.com performs only authenticated GET requests with the private
 * session captured before closing; it never repeats the prompt or opens a page.
 */
export class DetachedConversationPoller {
	constructor(options = {}) {
		this.fetcher = options.fetcher || globalThis.fetch?.bind(globalThis);
		this.reducer = options.reducer || new ConversationGraphReducer();
		this.intervalMs = Math.max(1000, Number(options.intervalMs || 2000));
		this.sleep = options.sleep || (ms => new Promise(resolve => setTimeout(resolve, ms)));
		this.now = options.now || (() => Date.now());
	}

	async poll(options = {}) {
		this.validate(options);
		const deadline = this.now() + Number(options.timeoutMs || 180000);
		let pollCount = 0;
		while (this.now() < deadline) {
			this.assertNotAborted(options.signal);
			const response = await this.fetcher(this.url(options.conversationId), {
				method: "GET",
				headers: this.headers(options.session),
				redirect: "follow",
				signal: options.signal || undefined
			});
			pollCount += 1;
			if (response.status === 200) {
				const document = await response.json();
				const reduced = this.reducer.reduce(document, options);
				if (reduced.done) {
					return { ...reduced, pollCount, status: 200,
						completionSource: "detached-authenticated-get" };
				}
			} else if (![202, 404].includes(response.status)) {
				throw codedError(`detached_conversation_get_${response.status}`);
			}
			await AbortSignalRace.run(options.signal, this.sleep(this.intervalMs));
		}
		throw codedError("detached_conversation_poll_timeout");
	}

	headers(session) {
		return {
			accept: "application/json",
			"accept-language": "en-US,en;q=0.9",
			"cache-control": "no-cache",
			cookie: session.cookieHeader,
			referer: "https://chatgpt.com/",
			"user-agent": session.userAgent,
			...session.headers
		};
	}

	url(conversationId) {
		return `https://chatgpt.com/backend-api/conversation/${encodeURIComponent(conversationId)}`;
	}

	validate(options) {
		if (!options.conversationId) throw new TypeError("conversationId is required.");
		if (!options.session?.cookieHeader) throw codedError("detached_session_missing");
	}

	assertNotAborted(signal) {
		if (signal?.aborted) throw signal.reason || codedError("detached_poll_cancelled");
	}
}

function codedError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}
