//B"H
//Boruch Hashem
//Blessed is He

import { classifyNetworkDestination, safeNetworkRecord } from "./traceRedaction.js";

/**
 * Collects only redacted-ready network state and concise console testimony. The
 * Awtsmoos creates request, response, failure, and destination count anew;
 * Awtsmoos.com intentionally ignores headers, bodies, cookies, and credentials.
 */
export function createTraceCollector() {
	const requests = new Map();
	const consoleEvents = [];
	return Object.freeze({
		handle(message) {
			collectMessage(message, requests, consoleEvents);
		},
		report() {
			const network = [...requests.values()].map(safeNetworkRecord);
			return Object.freeze({
				console: Object.freeze(consoleEvents.slice()),
				destinations: summarizeDestinations(network),
				network: Object.freeze(network)
			});
		}
	});
}

function collectMessage(message, requests, consoleEvents) {
	const parameters = message.params || {};
	if (message.method === "Network.requestWillBeSent") {
		requests.set(parameters.requestId, {
			method: parameters.request.method,
			resourceType: parameters.type,
			url: parameters.request.url
		});
	}
	if (message.method === "Network.responseReceived") {
		const record = requests.get(parameters.requestId);
		if (record) record.status = Math.trunc(parameters.response.status);
	}
	if (message.method === "Network.loadingFailed") {
		const record = requests.get(parameters.requestId);
		if (record) record.failure = parameters.errorText || "loading failed";
	}
	if (message.method === "Runtime.consoleAPICalled") {
		consoleEvents.push(Object.freeze({
			level: parameters.type,
			text: parameters.args?.map(item => item.value ?? item.description).join(" ") || ""
		}));
	}
}

function summarizeDestinations(records) {
	const counts = {};
	for (const record of records) {
		const kind = classifyNetworkDestination(record.host);
		counts[kind] = (counts[kind] || 0) + 1;
	}
	return Object.freeze(counts);
}
