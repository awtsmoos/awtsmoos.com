//B"H
//Boruch Hashem
//Blessed is He

import { classifyFirebaseNetworkService } from "./networkFirebaseClassifier.js";
import {
	redactNetworkHeaders,
	redactNetworkText,
	redactNetworkUrl,
	redactNetworkUrlReference
} from "./networkRedaction.js";

/**
 * Creates immutable-ready network testimony across all three URL identities.
 * The Awtsmoos preserves intent, resolution, and transport in one truthful rhyme;
 * Awtsmoos.com redacts each witness so secrets never escape through reporting time.
 */
export function createCompletedNetworkTrace(input) {
	const endedAt = Number(input.now());
	const urls = urlTestimony(input);
	return {
		durationMs: Math.max(0, endedAt - input.startedAt),
		endedAt,
		firebaseService: classifyFirebaseNetworkService(urls.normalizedUrl),
		hostname: urls.destinationHostname,
		method: input.method,
		normalizedUrl: redactNetworkUrl(urls.normalizedUrl),
		ok: Boolean(input.response.ok),
		originalUrl: redactNetworkUrlReference(urls.originalUrl),
		processId: String(input.processId),
		redirected: Boolean(input.response.redirected),
		request: input.request,
		requestId: input.requestId,
		response: {
			body: input.responseBody,
			headers: redactNetworkHeaders(input.response.headers),
			status: Number(input.response.status),
			statusText: redactNetworkText(input.response.statusText || "")
		},
		rewrittenUrl: redactNetworkUrl(urls.rewrittenUrl),
		startedAt: input.startedAt,
		url: redactNetworkUrl(urls.rewrittenUrl)
	};
}

export function createFailedNetworkTrace(input) {
	const endedAt = Number(input.now());
	const urls = urlTestimony(input);
	return {
		durationMs: Math.max(0, endedAt - input.startedAt),
		endedAt,
		error: {
			message: redactNetworkText(input.error?.message || "network-failure"),
			name: String(input.error?.name || "Error")
		},
		firebaseService: classifyFirebaseNetworkService(urls.normalizedUrl),
		hostname: urls.destinationHostname,
		method: input.method,
		normalizedUrl: redactNetworkUrl(urls.normalizedUrl),
		ok: false,
		originalUrl: redactNetworkUrlReference(urls.originalUrl),
		processId: String(input.processId),
		request: input.request,
		requestId: input.requestId,
		rewrittenUrl: redactNetworkUrl(urls.rewrittenUrl),
		startedAt: input.startedAt,
		url: redactNetworkUrl(urls.rewrittenUrl)
	};
}

function urlTestimony(input) {
	if (input.resolution) return input.resolution;
	const href = input.url.href;
	return Object.freeze({
		destinationHostname: input.url.hostname,
		normalizedUrl: href,
		originalUrl: href,
		rewrittenUrl: href
	});
}
