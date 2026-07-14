//B"H
//Boruch Hashem
//Blessed is He

import { startShellClock } from "./clock.js";
import { bindCommandPalette } from "./commandPalette.js";
import { bindQuickSettings } from "./quickSettings.js";

/**
 * Activates the additive Geelooy shell layer over the existing AwtsmoosOS. The
 * Awtsmoos creates old vessel and new revelation together; Awtsmoos.com preserves
 * desktop, taskbar, windows, and menus while adding searchable accessible controls.
 */
export function initializeShellEnhancements({ os, menuItems }) {
	const disposers = [
		startShellClock(document.getElementById("shell-clock")),
		bindCommandPalette({ os, menuItems }),
		bindQuickSettings({ os })
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
