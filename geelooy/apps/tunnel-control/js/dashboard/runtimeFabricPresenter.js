// B"H
// Boruch Hashem
// Blessed is He

import { listRuntimes } from "../runtime/runtimeRegistry.js";
import { getRuntimeTelemetry } from "../runtime/runtimeTelemetry.js";
import { setDeckCardState, setDeckText } from "./runtimeBoardDom.js";

const STALE_AFTER_MS = 30000;

/** Presents the latest structured runtime snapshot with finite time labels. */
export function refreshRuntimeFabric(now = Date.now()) {
	const snapshot = getRuntimeTelemetry();
	const currentTime = timestamp(now) || Date.now();
	setDeckText("awtDeckTunnelCount", formatTelemetryCount(resolveTunnelCount(snapshot)));
	setDeckText("awtDeckWorkerCount", formatTelemetryCount(snapshot.counts.activeWorkers));
	setDeckText("awtDeckQueueCount", formatTelemetryCount(snapshot.counts.queuedActions));
	setDeckText("awtDeckBrowserCount", formatTelemetryCount(snapshot.counts.browserTargets));
	setDeckText("awtDeckShellCount", formatTelemetryCount(snapshot.counts.shellSessions));
	setDeckText("awtDeckFreshness", formatTelemetryFreshness(snapshot.observedAt, currentTime));
	setDeckCardState("awtDeckFabricCard", resolveFabricState(snapshot.observedAt, currentTime));
}

/** Formats a count without converting unknown into zero. */
export function formatTelemetryCount(value) {
	return Number.isFinite(value) ? String(value) : "Not reported";
}

/** Formats freshness without ever exposing invalid arithmetic such as NaNs. */
export function formatTelemetryFreshness(observedAt, now = Date.now()) {
	const observed = timestamp(observedAt);
	const current = timestamp(now) || Date.now();
	if (!observed) return "Waiting for an API envelope";
	const seconds = Math.max(0, Math.floor((current - observed) / 1000));
	if (seconds < 2) return "Just now";
	if (seconds < 30) return `${seconds}s ago`;
	return `Stale · ${seconds}s ago`;
}

function resolveTunnelCount(snapshot) {
	if (Number.isFinite(snapshot.counts.tunnels)) return snapshot.counts.tunnels;
	return listRuntimes().filter(function isConnected(runtime) {
		return Boolean(runtime.tunnel?.connected);
	}).length;
}

function resolveFabricState(observedAt, now) {
	const observed = timestamp(observedAt);
	if (!observed) return "is-idle";
	return now - observed > STALE_AFTER_MS ? "is-warning" : "is-live";
}

function timestamp(value) {
	if (Number.isFinite(value)) return Number(value);
	if (typeof value === "string" && value.trim()) {
		const parsed = Date.parse(value);
		return Number.isFinite(parsed) ? parsed : 0;
	}
	return 0;
}
