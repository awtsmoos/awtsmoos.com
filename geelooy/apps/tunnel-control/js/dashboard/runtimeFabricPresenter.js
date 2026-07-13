// B"H
// Boruch Hashem
// Blessed is He

import { listRuntimes } from "../runtime/runtimeRegistry.js";
import { getRuntimeTelemetry } from "../runtime/runtimeTelemetry.js";
import { setDeckCardState, setDeckText } from "./runtimeBoardDom.js";

/**
 * The Awtsmoos lets measured runtime truth illuminate one card without
 * borrowing counts from another pane in Awtsmoos.com.
 */

const STALE_AFTER_MS = 30000;

/**
 * Presents the latest structured runtime snapshot.
 *
 * @param {number} now Current timestamp for deterministic freshness labels.
 * @returns {void}
 */
export function refreshRuntimeFabric(now = Date.now()) {
	const snapshot = getRuntimeTelemetry();
	setDeckText(
		"awtDeckTunnelCount",
		formatTelemetryCount(resolveTunnelCount(snapshot))
	);
	setDeckText(
		"awtDeckWorkerCount",
		formatTelemetryCount(snapshot.counts.activeWorkers)
	);
	setDeckText(
		"awtDeckQueueCount",
		formatTelemetryCount(snapshot.counts.queuedActions)
	);
	setDeckText(
		"awtDeckBrowserCount",
		formatTelemetryCount(snapshot.counts.browserTargets)
	);
	setDeckText(
		"awtDeckShellCount",
		formatTelemetryCount(snapshot.counts.shellSessions)
	);
	setDeckText(
		"awtDeckFreshness",
		formatTelemetryFreshness(snapshot.observedAt, now)
	);
	setDeckCardState(
		"awtDeckFabricCard",
		resolveFabricState(snapshot.observedAt, now)
	);
}

/**
 * Formats a count without converting unknown into zero.
 *
 * @param {number|null} value Observed count.
 * @returns {string} Human-readable count.
 */
export function formatTelemetryCount(value) {
	if (!Number.isFinite(value)) {
		return "Not reported";
	}
	return String(value);
}

/**
 * Formats freshness without hiding stale data.
 *
 * @param {number} observedAt Observation timestamp.
 * @param {number} now Current timestamp.
 * @returns {string} Human-readable freshness.
 */
export function formatTelemetryFreshness(observedAt, now = Date.now()) {
	if (!observedAt) {
		return "Waiting for an API envelope";
	}
	const seconds = Math.max(0, Math.floor((now - observedAt) / 1000));
	if (seconds < 2) {
		return "Just now";
	}
	if (seconds < 30) {
		return `${seconds}s ago`;
	}
	return `Stale · ${seconds}s ago`;
}

function resolveTunnelCount(snapshot) {
	if (Number.isFinite(snapshot.counts.tunnels)) {
		return snapshot.counts.tunnels;
	}
	return listRuntimes().filter(function isConnected(runtime) {
		return Boolean(runtime.tunnel?.connected);
	}).length;
}

function resolveFabricState(observedAt, now) {
	if (!observedAt) {
		return "is-idle";
	}
	if (now - observedAt > STALE_AFTER_MS) {
		return "is-warning";
	}
	return "is-live";
}
