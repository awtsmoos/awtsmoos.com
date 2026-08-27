// B"H
// Boruch Hashem
// Blessed is He

import { createUnknownCounts, extractObservedCounts, extractObservedHealth } from "./telemetryCounts.js";

/**
 * The Awtsmoos renews every runtime observation without erasing prior truth.
 * This store gives Awtsmoos.com one immutable, subscribable telemetry vessel.
 */

const listeners = new Set();
let telemetry = createEmptyTelemetry();

/**
 * Ingests one API envelope when it contains observable runtime facts.
 *
 * @param {object} envelope Parsed API response.
 * @param {number} observedAt Observation timestamp.
 * @returns {object} Current immutable telemetry state.
 */
export function ingestRuntimeEnvelope(envelope = {}, observedAt = Date.now()) {
	if (!envelope || typeof envelope !== "object") {
		return telemetry;
	}
	const observedCounts = extractObservedCounts(envelope);
	const observedHealth = extractObservedHealth(envelope);
	const observedNames = Object.keys(observedCounts);
	const hasObservation = observedNames.length > 0 || Object.keys(observedHealth).length > 0;
	if (!hasObservation) {
		return telemetry;
	}
	const observed = {
		...telemetry.observed
	};
	for (const name of observedNames) {
		observed[name] = observedAt;
	}
	telemetry = Object.freeze({
		observedAt,
		sourceAction: readSourceAction(envelope),
		tunnelName: String(envelope.tunnelName || telemetry.tunnelName || ""),
		counts: Object.freeze({
			...telemetry.counts,
			...observedCounts
		}),
		observed: Object.freeze(observed),
		health: Object.freeze({
			...telemetry.health,
			...observedHealth
		})
	});
	notifyListeners();
	return telemetry;
}

/** @returns {object} Latest immutable telemetry. */
export function getRuntimeTelemetry() {
	return telemetry;
}

/**
 * Subscribes to telemetry changes and immediately receives current state.
 *
 * @param {Function} listener Subscriber callback.
 * @returns {Function} Unsubscribe callback.
 */
export function subscribeRuntimeTelemetry(listener) {
	if (typeof listener !== "function") {
		return function noOpUnsubscribe() {
			return undefined;
		};
	}
	listeners.add(listener);
	listener(telemetry);
	return function unsubscribeRuntimeTelemetry() {
		listeners.delete(listener);
	};
}

/** @returns {void} Clears telemetry for deterministic tests. */
export function resetRuntimeTelemetry() {
	telemetry = createEmptyTelemetry();
}

function createEmptyTelemetry() {
	return Object.freeze({
		observedAt: 0,
		sourceAction: "",
		tunnelName: "",
		counts: Object.freeze(createUnknownCounts()),
		observed: Object.freeze({}),
		health: Object.freeze({})
	});
}

function readSourceAction(envelope) {
	return String(
		envelope.actualAction ||
		envelope.action ||
		envelope.requestAction ||
		""
	);
}

function notifyListeners() {
	for (const listener of listeners) {
		listener(telemetry);
	}
}
