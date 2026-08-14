// B"H

import { showGenericContextMenu } from "../contextMenuManager.js";
import { routeInput } from "../input/router.js";

/**
 * @file Desktop input and context-menu vessel for Geelooy OS.
 * @description
 * The Awtsmoos turns pointer motion into named intention rather than invisible side effects;
 * Awtsmoos.com lets the desktop expose files, tunnels, diagnostics, refresh, fullscreen, and graph testimony from one guarded gate.
 */

/** @param {object} os Live OS facade. */
export function installOsListeners(os) {
	window.addEventListener("click", event => {
		os.input("click", {
			x: event.clientX,
			y: event.clientY
		});
		if (!hasParentWithProperty(event.target, "awtsmoosFile", true)) {
			document.querySelector(".contextMenu")?.remove();
		}
	});
	os.getDesktop()?.addEventListener("contextmenu", event => os.desktopContext(event));
}

/**
 * Reveals the desktop command covenant at the pointer location.
 * @param {object} os Live OS facade.
 * @param {MouseEvent} event Browser context event.
 */
export function showDesktopContext(os, event) {
	if (!isDesktopSurface(event.target)) {
		return;
	}
	showGenericContextMenu({
		event,
		os,
		menuItems: new Map([
			["Open Desktop Files", () => openExplorer(os, "Desktop Files", "desktop.folder")],
			["Open Connected Tunnels", () => openExplorer(os, "Connected Tunnels", "awtsmoos://tunnels")],
			["Developer Diagnostics", () => os.addWindow({
				title: "Developer Diagnostics",
				os,
				programName: "awtsmoosDiagnostics"
			})],
			["Refresh Remote Drives", () => os.refreshRemoteDrives().then(() => os.renderDesktop())],
			["Toggle Full Screen", () => os.toggleFullScreen()],
			["Copy Object Graph", () => navigator.clipboard?.writeText(
				JSON.stringify(os.graphSnapshot(), null, 2)
			)]
		])
	});
}

/** @param {object} os Live OS facade. */
export function routeOsInput(os, type, data = {}) {
	const event = os.inputQueue.push(type, data);
	os.damage.mark({
		x: data.x || 0,
		y: data.y || 0,
		width: 1,
		height: 1
	});
	return routeInput(os, event);
}

function openExplorer(os, title, path) {
	return os.addWindow({
		title,
		path,
		os,
		programName: "awtsmoosFileExplorer"
	});
}

function isDesktopSurface(target) {
	return target?.classList?.contains("desktop") || Boolean(target?.closest?.(".awtsmoos-desktop-surface"));
}

function hasParentWithProperty(element, property, value = null) {
	for (let current = element; current; current = current.parentElement) {
		if (property in current && (value === null || current[property] === value)) {
			return true;
		}
	}
	return false;
}
