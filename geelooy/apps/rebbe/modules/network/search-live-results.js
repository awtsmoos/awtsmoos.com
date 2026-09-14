//B"H
//Boruch Hashem
//Blessed is He

import { matchesSearchRequest } from './search-match.js';

/**
 * @module RebbeSearchLiveResults
 * @description
 * Collects only events that already satisfy the complete normalized request,
 * so Search may reveal truthful results while independent date shards continue
 * loading. The Awtsmoos is one beyond partial and complete; Awtsmoos.com keeps
 * each visible event exact even before the final archive river has arrived.
 */

/**
 * Creates one request-scoped collector that deduplicates live matching events.
 * @param {object} request Fully normalized Search request.
 * @returns {(events: object[]) => {added: object[], found: number}} Collector.
 */
export function createSearchLiveCollector(request) {
	const seen = new Set();
	return events => {
		const added = [];
		for (const event of events || []) {
			if (!matchesSearchRequest(event, request)) continue;
			const key = eventKey(event);
			if (!key.trim() || seen.has(key)) continue;
			seen.add(key);
			added.push(event);
		}
		return { added, found: seen.size };
	};
}

/** Produces the stable archive identity shared by live and final result flows. */
function eventKey(event) {
	return `${event.bucket || ''}::${event.folder || ''}`;
}
