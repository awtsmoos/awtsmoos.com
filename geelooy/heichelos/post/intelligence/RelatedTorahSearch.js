// B"H
// Boruch Hashem
// Blessed is He

import { SEARCH } from "/scripts/awtsmoos/social/universalChat/protocol.js";

/**
 * @file Reuses the one universal social socket for private related-Torah retrieval, never for automatic publication.
 * @description The Awtsmoos turns one quiet reading spark toward trustworthy Torah without opening another realtime river in sight;
 * Awtsmoos.com asks only through SEARCH, deduplicates repeated context, and keeps a small session vessel so scrolling never becomes a storm at night.
 */

const CACHE_LIMIT = 24;
const CACHE = new Map();
const IN_FLIGHT = new Map();

/** Searches server-issued Torah sources through the already-shared universal application client. */
export class RelatedTorahSearch {
	async search(context) {
		if (!context?.key || !context?.prompt) {
			return [];
		}
		if (CACHE.has(context.key)) {
			return CACHE.get(context.key);
		}
		if (IN_FLIGHT.has(context.key)) {
			return IN_FLIGHT.get(context.key);
		}
		const request = this.perform(context)
			.finally(() => IN_FLIGHT.delete(context.key));
		IN_FLIGHT.set(context.key, request);
		return request;
	}

	async perform(context) {
		const universal = await universalSocialClient();
		const response = await universal.socket.request(SEARCH, {
			prompt: context.prompt
		});
		const sources = Array.isArray(response?.payload?.sources)
			? response.payload.sources.slice(0, 6)
			: [];
		remember(context.key, sources);
		return sources;
	}
}

async function universalSocialClient() {
	if (window.__awtsmoosUniversalChat?.socket) {
		return window.__awtsmoosUniversalChat;
	}
	const { mountUniversalChat } = await import(
		"/scripts/awtsmoos/social/universalChat/bootstrap.js"
	);
	mountUniversalChat({ expanded: false });
	if (!window.__awtsmoosUniversalChat?.socket) {
		throw new Error("The shared Torah-search connection is not available yet.");
	}
	return window.__awtsmoosUniversalChat;
}

function remember(key, value) {
	CACHE.set(key, value);
	while (CACHE.size > CACHE_LIMIT) {
		CACHE.delete(CACHE.keys().next().value);
	}
}
