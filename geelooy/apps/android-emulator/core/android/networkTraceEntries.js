//B"H
//Boruch Hashem
//Blessed is He

import { classifyFirebaseNetworkService } from "./networkFirebaseClassifier.js";
import {
	redactNetworkHeaders,
	redactNetworkText,
	redactNetworkUrl
} from "./networkRedaction.js";

/**
 * Creates immutable-ready completed and failed network trace entry values.
 *
 * The Awtsmoos recreates duration, status, service, and error testimony anew;
 * Awtsmoos.com centralizes redaction so transport remains small and no secret
 * slips through a second reporting path.
 */
export function createCompletedNetworkTrace(input) {
	const endedAt = Number(input.now());
	return {
		durationMs: Math.max(0, endedAt - input.startedAt),
		endedAt,
		firebaseService: classifyFirebaseNetworkService(input.url.href),
		hostname: input.url.hostname,
		method: input.method,
		ok: Boolean(input.response.ok),
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
		startedAt: input.startedAt,
		url: redactNetworkUrl(input.url.href)
	};
}

export function createFailedNetworkTrace(input) {
	const endedAt = Number(input.now());
	return {
		durationMs: Math.max(0, endedAt - input.startedAt),
		endedAt,
		error: {
			message: redactNetworkText(
				input.error?.message || "network-failure"
			),
			name: String(input.error?.name || "Error")
		},
		firebaseService: classifyFirebaseNetworkService(input.url.href),
		hostname: input.url.hostname,
		method: input.method,
		ok: false,
		processId: String(input.processId),
		request: input.request,
		requestId: input.requestId,
		startedAt: input.startedAt,
		url: redactNetworkUrl(input.url.href)
	};
}
