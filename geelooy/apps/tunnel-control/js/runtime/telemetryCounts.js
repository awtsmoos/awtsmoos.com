// B"H
// Boruch Hashem
// Blessed is He

import { TELEMETRY_COUNT_PATHS, TELEMETRY_EXTRA_COUNT_KEYS } from "./telemetryPaths.js";
import { countTelemetryCollection, normalizeTelemetryCount, readFirstTelemetryValue } from "./telemetryValueReader.js";

/**
 * The Awtsmoos distinguishes an observed zero from an unobserved void. These
 * pure helpers count only values actually present in an Awtsmoos.com envelope.
 */

/** @returns {object} Count map initialized to unknown values. */
export function createUnknownCounts() {
	const keys = [
		...Object.keys(TELEMETRY_COUNT_PATHS),
		...TELEMETRY_EXTRA_COUNT_KEYS
	];
	return Object.fromEntries(
		keys.map(function createUnknownEntry(key) {
			return [key, null];
		})
	);
}

/**
 * Extracts every count that the envelope actually reports.
 *
 * @param {object} envelope Parsed response envelope.
 * @returns {object} Sparse observed count map.
 */
export function extractObservedCounts(envelope = {}) {
	const counts = {};
	for (const [name, paths] of Object.entries(TELEMETRY_COUNT_PATHS)) {
		const value = readFirstTelemetryValue(envelope, paths);
		assignObserved(
			counts,
			name,
			countTelemetryCollection(value)
		);
	}
	assignQueueCounts(counts, envelope.queueStats);
	assignBrowserLeaseCount(counts, envelope);
	return counts;
}

/**
 * Extracts sparse health facts without replacing unreported values.
 *
 * @param {object} envelope Parsed response envelope.
 * @returns {object} Sparse health map.
 */
export function extractObservedHealth(envelope = {}) {
	const health = {};
	const queue = envelope.queueStats;
	assignObserved(
		health,
		"eventLoopLagMs",
		normalizeTelemetryCount(queue?.eventLoopLag?.lastMs)
	);
	if (queue?.circuit?.level) {
		health.circuitLevel = String(queue.circuit.level);
	}
	if (typeof envelope.longLivedConnections === "boolean") {
		health.longLivedConnections = envelope.longLivedConnections;
	}
	return health;
}

function assignQueueCounts(counts, queue) {
	if (!queue || typeof queue !== "object") {
		return;
	}
	assignObserved(counts, "activeWorkers", normalizeTelemetryCount(queue.workers?.activeTotal));
	assignObserved(counts, "queuedActions", normalizeTelemetryCount(queue.queued));
	assignObserved(counts, "supervisors", normalizeTelemetryCount(queue.workers?.supervisors));
	assignObserved(counts, "failedWorkers", normalizeTelemetryCount(queue.workers?.recentFailed));
}

function assignBrowserLeaseCount(counts, envelope) {
	const pages = readFirstTelemetryValue(
		envelope,
		TELEMETRY_COUNT_PATHS.browserTargets
	);
	if (!Array.isArray(pages)) {
		return;
	}
	const leasedBrowsers = pages.filter(
		function hasBrowserLease(page) {
			return Boolean(page?.lease);
		}
	).length;
	assignObserved(counts, "leasedBrowsers", leasedBrowsers);
}

function assignObserved(target, name, value) {
	if (value === null || value === undefined) {
		return;
	}
	target[name] = value;
}
