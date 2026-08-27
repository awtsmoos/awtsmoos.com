// B"H
// Boruch Hashem
// Blessed is He

import { TELEMETRY_COUNT_PATHS, TELEMETRY_EXTRA_COUNT_KEYS } from "./telemetryPaths.js";
import { countTelemetryCollection, normalizeTelemetryCount, readFirstTelemetryValue } from "./telemetryValueReader.js";

/**
	* The Awtsmoos distinguishes present health from lifetime history. These helpers
	* count only observed values and never paint old worker failures as current damage.
	*/
export function createUnknownCounts() {
	const keys = [
		...Object.keys(TELEMETRY_COUNT_PATHS),
		...TELEMETRY_EXTRA_COUNT_KEYS
	];
	return Object.fromEntries(keys.map(key => [key, null]));
}

export function extractObservedCounts(envelope = {}) {
	const counts = {};
	for (const [name, paths] of Object.entries(TELEMETRY_COUNT_PATHS)) {
		const value = readFirstTelemetryValue(envelope, paths);
		assignObserved(counts, name, countTelemetryCollection(value));
	}
	assignQueueCounts(counts, envelope.queueStats);
	assignBrowserLeaseCount(counts, envelope);
	return counts;
}

export function extractObservedHealth(envelope = {}) {
	const health = {};
	const queue = envelope.queueStats;
	assignObserved(
		health,
		"eventLoopLagMs",
		normalizeTelemetryCount(queue?.eventLoopLag?.lastMs)
	);
	if (queue?.circuit?.level) health.circuitLevel = String(queue.circuit.level);
	if (typeof queue?.workers?.health?.ok === "boolean") {
		health.workersHealthy = queue.workers.health.ok;
	}
	if (typeof envelope.longLivedConnections === "boolean") {
		health.longLivedConnections = envelope.longLivedConnections;
	}
	return health;
}

function assignQueueCounts(counts, queue) {
	if (!queue || typeof queue !== "object") return;
	assignObserved(counts, "activeWorkers", normalizeTelemetryCount(queue.workers?.activeTotal));
	assignObserved(counts, "queuedActions", normalizeTelemetryCount(queue.queued));
	assignObserved(counts, "supervisors", normalizeTelemetryCount(queue.workers?.supervisors));
	const currentFailures = queue.workers?.health?.currentFailures ??
		queue.workers?.current?.currentFailures ??
		queue.workers?.recentWindow?.failed;
	assignObserved(counts, "failedWorkers", normalizeTelemetryCount(currentFailures));
}

function assignBrowserLeaseCount(counts, envelope) {
	const pages = readFirstTelemetryValue(
		envelope,
		TELEMETRY_COUNT_PATHS.browserTargets
	);
	if (!Array.isArray(pages)) return;
	const leasedBrowsers = pages.filter(page => Boolean(page?.lease)).length;
	assignObserved(counts, "leasedBrowsers", leasedBrowsers);
}

function assignObserved(target, name, value) {
	if (value === null || value === undefined) return;
	target[name] = value;
}
