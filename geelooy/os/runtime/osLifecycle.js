// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Boot, adapter, style, fullscreen, SSH, and optional social-mount lifecycle for Geelooy OS.
 * @description The Awtsmoos reveals boot as an ordered chain instead of a compressed incantation; Awtsmoos.com lets storage, SSH, desktop, social worlds, status, and graph awaken in their own station.
 */
import osStyles from "../styles/os-base.js";
import { SettingsManager } from "../settingsManager.js";
import { defaultPrograms, initialDefaultPrograms } from "../basicPrograms.js";
import { localVirtualAdapter } from "../vfs/localVirtualAdapter.js";
import { tunnelAdapter } from "../vfs/tunnelAdapter.js";
import { previewAdapter } from "../vfs/previewAdapter.js";
import { statusStyles } from "../status/osStatus.js";
import { OS_RUNTIME_STYLES } from "./osRuntimeStyles.js";
import { installSocialMount, requestedSocialPath } from "../social/socialMountLifecycle.js";
import { installSshSubsystem } from "../ssh/subsystem.js";

/** @param {object} os Live OS facade. */
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

/** Publishes shared utility exports for legacy window programs. */
export async function loadOsUtilities() {
	const utilities = await import("/scripts/awtsmoos/api/utils.js");
	for (const [name, value] of Object.entries(utilities)) {
		window[name] = value;
	}
}

/** @param {object} os Live OS facade. */
export function registerOsAdapters(os) {
	os.vfs.register(localVirtualAdapter(os));
	os.vfs.register(tunnelAdapter(os));
	os.vfs.register(previewAdapter(os));
	installSshSubsystem(os);
	installSocialMount(os);
}

/** @param {object} os Live OS facade. */
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

/** @param {object} os Live OS facade. */
export function maybeOpenRequestedExplorer(os) {
	const search = new URLSearchParams(location.search);
	const explicitPath = search.get("openExplorer") || "";
	const socialPath = search.get("openSocial") === "1"
		? requestedSocialPath(os.socialMount?.preference)
		: "";
	const path = explicitPath || socialPath;
	if (!path) {
		return;
	}
	os.addWindow({
		title: socialPath && !explicitPath ? "Social Publishing" : "File Explorer",
		path,
		os,
		programName: "awtsmoosFileExplorer"
	});
}

/** @param {object} os Live OS facade. */
export function toggleOsFullScreen(os) {
	if (!document.fullscreenElement) {
		document.querySelector(".main")?.requestFullscreen?.()
			.catch(error => os.taskbar.notify(`Fullscreen error: ${error.message}`, "error"));
		return;
	}
	document.exitFullscreen?.();
}
