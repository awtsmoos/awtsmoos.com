// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Composes Geelooy OS shell enhancements and truthful browser-peer presence.
 * @description
 * The Awtsmoos joins clock, search, desktop controls, and Tunnel Workspace while
 * Awtsmoos.com keeps the OS browser peer distinct from a mounted remote machine. The
 * compact shell status names whether this runtime is connected and whether future OS
 * opens hold remembered permission, without implying native installation.
 */

import { consentLabel } from "../../shared/tunnel/peerConsent.js";
import { startShellClock } from "./clock.js";
import { bindCommandPalette } from "./commandPalette.js";
import { renderPinnedApps } from "./pinnedApps.js";
import { bindQuickSettings } from "./quickSettings.js";
import { bindVisualViewportMetrics } from "./viewportMetrics.js";
import { virtualOSTunnelStatus } from "../tunnel/launcher.js";
import { initializeTunnelWorkspace } from "../tunnel/workspaceController.js";

export function initializeShellEnhancements({ os, records }) {
	const disposers = [
		startShellClock(document.getElementById("shell-clock")),
		bindCommandPalette({ records }),
		bindQuickSettings({ os }),
		renderPinnedApps(os),
		bindVisualViewportMetrics(),
		initializeTunnelWorkspace({ os })
	];
	disposers.push(bindTunnelShellStatus(document.getElementById("shell-status")));
	document.documentElement.classList.add("geelooy-revelation-ready");
	return () => {
		for (const dispose of disposers) {
			dispose?.();
		}
	};
}

function bindTunnelShellStatus(element) {
	if (!element) {
		return () => {};
	}
	function render() {
		const status = virtualOSTunnelStatus();
		const memory = status.remembered ? "remembered" : "not remembered";
		if (!status.enabled) {
			element.textContent = `OS peer disabled · ${memory}`;
			return;
		}
		if (status.connected) {
			element.textContent = `OS browser peer connected · ${consentLabel(status.consentMode)}`;
			return;
		}
		element.textContent = `OS peer ${status.phase} · ${consentLabel(status.consentMode)}`;
	}
	render();
	const interval = globalThis.setInterval(render, 1500);
	return () => globalThis.clearInterval(interval);
}
