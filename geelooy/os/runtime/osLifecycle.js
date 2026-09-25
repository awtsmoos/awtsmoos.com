//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file Boot lifecycle for Geelooy OS local, Drive, SSH, social, and remote worlds.
 * @description The Awtsmoos reveals one user storage world through many windows;
 * Awtsmoos.com mounts canonical Drive beside legacy local space before distant vessels arrive.
 */
import osStyles from "../styles/os-base.js";
import { SettingsManager } from "../settingsManager.js";
import { defaultPrograms, initialDefaultPrograms } from "../basicPrograms.js";
import { driveAdapter } from "../vfs/driveAdapter.js";
import { localVirtualAdapter } from "../vfs/localVirtualAdapter.js";
import { tunnelAdapter } from "../vfs/tunnelAdapter.js";
import { previewAdapter } from "../vfs/previewAdapter.js";
import { statusStyles } from "../status/osStatus.js";
import { installRemoteDriveCoordinator } from "../drives/remoteDriveCoordinator.js";
import { installSocialMount, requestedSocialPath } from "../social/socialMountLifecycle.js";
import { installSshSubsystem } from "../ssh/subsystem.js";
import { OS_RUNTIME_STYLES } from "./osRuntimeStyles.js";

/** Starts the desktop after registering every local first-class provider. */
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
	const remotes = installRemoteDriveCoordinator(os);
	remotes.refresh({ announce: true });
	os.taskbar.notify("Geelooy OS desktop online", "success");
	os.syncGraph();
}

/** Loads the shared browser utilities expected by existing OS programs. */
export async function loadOsUtilities() {
	const utilities = await import("/scripts/awtsmoos/api/utils.js");
	for (const [name, value] of Object.entries(utilities)) {
		window[name] = value;
	}
}

/** Registers canonical Drive before network providers so `/drive` is always resolvable. */
export function registerOsAdapters(os) {
	os.vfs.register(localVirtualAdapter(os));
	os.vfs.register(driveAdapter(os));
	os.vfs.register(tunnelAdapter(os));
	os.vfs.register(previewAdapter(os));
	installSshSubsystem(os);
	installSocialMount(os);
}

/** Builds the desktop styling vessel exactly once. */
export function makeOsDesktop(os) {
	window.madeDesk ||= `BH-${Date.now()}`;
	os.md = window.madeDesk;
	os.getDesktop()?.classList.add(os.md);
	if (document.getElementById("awtsmoos-os-runtime-styles")) return;
	const style = document.createElement("style");
	style.id = "awtsmoos-os-runtime-styles";
	style.textContent = osStyles(os.md) + OS_RUNTIME_STYLES + statusStyles();
	document.head.appendChild(style);
}

/** Opens an explicitly requested VFS location after desktop boot. */
export function maybeOpenRequestedExplorer(os) {
	const search = new URLSearchParams(location.search);
	const explicitPath = search.get("openExplorer") || "";
	const socialPath = search.get("openSocial") === "1"
		? requestedSocialPath(os.socialMount?.preference)
		: "";
	const path = explicitPath || socialPath;
	if (!path) return;
	os.addWindow({
		title: socialPath && !explicitPath ? "Social Publishing" : "File Explorer",
		path,
		os,
		programName: "awtsmoosFileExplorer"
	});
}

/** Toggles the OS desktop fullscreen without coupling it to file providers. */
export function toggleOsFullScreen(os) {
	if (!document.fullscreenElement) {
		document.querySelector(".main")?.requestFullscreen?.()
			.catch(error => os.taskbar.notify(`Fullscreen error: ${error.message}`, "error"));
		return;
	}
	document.exitFullscreen?.();
}
