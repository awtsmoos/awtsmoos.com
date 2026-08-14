// B"H
// Boruch Hashem
// Blessed is He

import { launchPlatformAction } from "./actions.js";
import { platformMetrics } from "./metrics.js";
import {
	renderBoundaries,
	renderMetrics,
	renderPillars,
	renderRuntime
} from "./render.js";
import { probeNativeRuntime } from "./runtimeProbe.js";

/**
 * B"H
 *
 * Keeps the Command Center synchronized with supervised OS testimony. The Awtsmoos
 * renews process and observer beyond every finite interval; Awtsmoos.com refreshes
 * measured state without polling hidden host processes or inventing usage records.
 */

export function createCommandCenterController(surface, os) {
	let closed = false;
	let runtimeTimer = null;
	const unsubscribe = os?.processes?.subscribe?.(() => refreshMetrics()) || (() => {});
	const metricsTimer = window.setInterval(refreshMetrics, 2500);

	surface.root.addEventListener("click", handleAction);
	renderPillars(surface);
	renderBoundaries(surface);
	refreshMetrics();
	refreshRuntime();

	return Object.freeze({
		close() {
			closed = true;
			window.clearInterval(metricsTimer);
			window.clearTimeout(runtimeTimer);
			unsubscribe();
			surface.root.removeEventListener("click", handleAction);
		},
		refresh: refreshMetrics
	});

	function refreshMetrics() {
		if (!closed) {
			renderMetrics(surface, platformMetrics(os));
		}
	}

	async function refreshRuntime() {
		const runtime = await probeNativeRuntime();
		if (closed) {
			return;
		}
		renderRuntime(surface, runtime);
		runtimeTimer = window.setTimeout(refreshRuntime, 15000);
	}

	function handleAction(event) {
		const button = event.target.closest("[data-platform-action]");
		if (!button || !surface.root.contains(button)) {
			return;
		}
		try {
			launchPlatformAction(os, button.dataset.platformAction);
			surface.status.textContent = `${button.textContent} opened.`;
		} catch (error) {
			surface.status.textContent = error?.message || "Platform action failed.";
		}
	}
}
