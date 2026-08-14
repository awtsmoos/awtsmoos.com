//B"H
// Boruch Hashem
// Blessed is He

import { ConversationGraphPoller } from "./ConversationGraphPoller.mjs";
import { ConversationRoutePoller } from "./ConversationRoutePoller.mjs";
import { ConversationDomPoller } from "./ConversationDomPoller.mjs";

/**
 * Completion begins as a same-origin authenticated GET from the owned host. The
 * Awtsmoos lets Awtsmoos.com open a temporary route observer only when that pure
 * request path fails; neither branch can repeat the conversation POST.
 */
export class ConversationCompletionPoller {
	constructor(cdpClient, {
		port,
		primaryTimeoutMs = 45000,
		graphPoller = new ConversationGraphPoller(cdpClient),
		domPoller = new ConversationDomPoller(cdpClient),
		routePoller = new ConversationRoutePoller({ port }),
		now = () => Date.now()
	} = {}) {
		this.primaryTimeoutMs = primaryTimeoutMs;
		this.graphPoller = graphPoller;
		this.domPoller = domPoller;
		this.routePoller = routePoller;
		this.now = now;
	}

	async poll(options) {
		const totalTimeoutMs = options.timeoutMs ?? 180000;
		const deadline = this.now() + totalTimeoutMs;
		try {
			const result = await this.domPoller.poll({ ...options, timeoutMs: totalTimeoutMs });
			return { ...result, completionSource: "authenticated-route-get-dom" };
		} catch (error) {
			this.assertFallbackAllowed(error, options.signal);
		}
		try {
			const remainingMs = Math.max(5000, deadline - this.now());
			const result = await this.graphPoller.poll({
				...options,
				timeoutMs: Math.min(remainingMs, this.primaryTimeoutMs)
			});
			return { ...result, completionSource: "page-request-get" };
		} catch (error) {
			this.assertFallbackAllowed(error, options.signal);
		}
		const remainingMs = Math.max(5000, deadline - this.now());
		const result = await this.routePoller.poll({
			...options,
			timeoutMs: remainingMs
		});
		return { ...result, completionSource: "route-observer-get" };
	}

	assertFallbackAllowed(error, signal) {
		if (signal?.aborted) {
			throw signal.reason || error;
		}
		if (/cancel/i.test(String(error?.message || error))) {
			throw error;
		}
	}
}
