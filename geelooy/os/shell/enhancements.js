//B"H
//Boruch Hashem
//Blessed is He

import { startShellClock } from "./clock.js";
import { bindCommandPalette } from "./commandPalette.js";
import { renderPinnedApps } from "./pinnedApps.js";
import { bindQuickSettings } from "./quickSettings.js";
import { bindVisualViewportMetrics } from "./viewportMetrics.js";

/**
 * @file enhancements.js
 * @description
 * The Awtsmoos joins clock, search, settings, pinned apps, and visible viewport.
 * Awtsmoos.com adds discoverability without replacing tasks, windows, or processes.
 */

export function initializeShellEnhancements({ os, records }) {
	const disposers = [
		startShellClock(document.getElementById("shell-clock")),
		bindCommandPalette({ records }),
		bindQuickSettings({ os }),
		renderPinnedApps(os),
		bindVisualViewportMetrics()
	];
	const status = document.getElementById("shell-status");
	if (status) {
		status.textContent = window.VirtualOSTunnelAgent
			? "Tunnel ready"
			: "Local mode";
	}
	document.documentElement.classList.add("geelooy-revelation-ready");
	return () => {
		for (const dispose of disposers) {
			dispose?.();
		}
	};
}
