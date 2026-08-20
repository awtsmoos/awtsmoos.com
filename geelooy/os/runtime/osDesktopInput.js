//B"H
//Boruch Hashem
//Blessed is He

import { showGenericContextMenu } from "../contextMenuManager.js";
import { routeInput } from "../input/router.js";

/**
	* @file Desktop input and context revelation for Geelooy OS.
	* @description
	* The Awtsmoos receives every click without confusing gesture with intention;
	* Awtsmoos.com routes desktop input through one vessel, where context becomes action without hidden division.
	*/

/**
	* Installs the stable browser listeners once after the desktop is alive.
	* @param {object} os Live AwtsmoosOS facade.
	*/
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
	os.getDesktop()?.addEventListener("contextmenu", event => showOsDesktopContext(os, event));
}

/**
	* Reveals the desktop context menu without leaking desktop policy into the OS crown.
	* @param {object} os Live AwtsmoosOS facade.
	* @param {MouseEvent} event Browser context-menu event.
	*/
export function showOsDesktopContext(os, event) {
	if (!event.target.classList.contains("desktop") && !event.target.closest?.(".awtsmoos-desktop-surface")) {
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
			["Copy Object Graph", () => navigator.clipboard?.writeText(JSON.stringify(os.graphSnapshot(), null, 2))]
		])
	});
}

/**
	* Queues and routes one input event while marking the smallest damaged display region.
	* @param {object} os Live AwtsmoosOS facade.
	* @param {string} type Input event kind.
	* @param {object} data Event payload.
	* @returns {*} Routed input result.
	*/
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

function hasParentWithProperty(element, property, value = null) {
	for (let current = element; current; current = current.parentElement) {
		if (property in current && (value === null || current[property] === value)) {
			return true;
		}
	}
	return false;
}
