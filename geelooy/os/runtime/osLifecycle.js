//B"H
//Boruch Hashem
//Blessed is He

import osStyles from "../styles/os-base.js";
import { SettingsManager } from "../settingsManager.js";
import { defaultPrograms, initialDefaultPrograms } from "../basicPrograms.js";
import { localVirtualAdapter } from "../vfs/localVirtualAdapter.js";
import { tunnelAdapter } from "../vfs/tunnelAdapter.js";
import { previewAdapter } from "../vfs/previewAdapter.js";
import { statusStyles } from "../status/osStatus.js";
import { OS_RUNTIME_STYLES } from "./osRuntimeStyles.js";

/**
	* @file Geelooy OS lifecycle and boot composition.
	* @description
	* The Awtsmoos renews boot as an ordered revelation rather than one crowded line;
	* Awtsmoos.com lets utilities, storage, adapters, desktop, status, and remote drives awaken in visible sequence.
	*/

/**
	* Runs the historical AwtsmoosOS.start contract without changing its public doorway.
	* @param {object} os Live AwtsmoosOS facade.
	* @returns {Promise<void>} Resolves after local boot and remote refresh scheduling.
	*/
export async function startOs(os) {
	await os.loadUtilities();
	await os.db.init("awtsmoos-os");
	os.registerAdapters();
	Object.assign(defaultPrograms, await SettingsManager.load(os.db, initialDefaultPrograms));
	os.makeDesktop();
	os.renderDesktop();
	os.updateStatus();

	if (!os.started) {
		os.started = true;
		os.listeners();
		os.maybeOpenRequestedExplorer();
	}

	os.refreshRemoteDrives()
		.then(() => os.renderDesktop())
		.catch(() => os.updateStatus("needs-login"));

	os.taskbar.notify("Geelooy OS desktop online", "success");
	os.syncGraph();
}

/**
	* Publishes shared utility exports for legacy window programs.
	* @returns {Promise<void>} Resolves when utility exports are installed.
	*/
export async function loadOsUtilities() {
	const utilities = await import("/scripts/awtsmoos/api/utils.js");
	for (const [name, value] of Object.entries(utilities)) {
		window[name] = value;
	}
}

/**
	* Registers all canonical VFS adapters on a live OS.
	* @param {object} os Live AwtsmoosOS facade.
	*/
export function registerOsAdapters(os) {
	os.vfs.register(localVirtualAdapter(os));
	os.vfs.register(tunnelAdapter(os));
	os.vfs.register(previewAdapter(os));
}

/**
	* Installs desktop identity and runtime styles once.
	* @param {object} os Live AwtsmoosOS facade.
	*/
export function makeOsDesktop(os) {
	window.madeDesk ||= `BH-${Date.now()}`;
	os.md = window.madeDesk;
	os.getDesktop()?.classList.add(os.md);

	if (document.getElementById("awtsmoos-os-runtime-styles")) {
		return;
	}

	const style = document.createElement("style");
	style.id = "awtsmoos-os-runtime-styles";
	style.textContent = osStyles(os.md) + OS_RUNTIME_STYLES + statusStyles();
	document.head.appendChild(style);
}

/**
	* Opens a requested explorer route after the desktop exists.
	* @param {object} os Live AwtsmoosOS facade.
	*/
export function maybeOpenRequestedExplorer(os) {
	const path = new URLSearchParams(location.search).get("openExplorer");
	if (!path) {
		return;
	}
	os.addWindow({
		title: "File Explorer",
		path,
		os,
		programName: "awtsmoosFileExplorer"
	});
}

/**
	* Toggles browser fullscreen while routing errors through the taskbar.
	* @param {object} os Live AwtsmoosOS facade.
	*/
export function toggleOsFullScreen(os) {
	if (!document.fullscreenElement) {
		document.querySelector(".main")?.requestFullscreen()?.
			.catch(error => os.taskbar.notify(`Fullscreen error: ${error.message}`, "error"));
		return;
	}
	document.exitFullscreen?.();
}
