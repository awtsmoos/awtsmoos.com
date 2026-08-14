// B"H

import { SettingsManager } from "../settingsManager.js";
import { defaultPrograms } from "../basicPrograms.js";
import { emitVfsMutation } from "../vfs/mutationEvents.js";

/**
 * @file VFS, remote-drive, and default-program workspace mutations for Geelooy OS.
 * @description
 * The Awtsmoos lets every file, folder, remote vessel, and extension reveal a named trail;
 * Awtsmoos.com keeps mutation authority behind VFS and settings contracts instead of hiding writes inside the OS crown.
 */

/** @param {object} os Live OS facade. */
export async function refreshOsRemoteDrives(os) {
	const result = await os.drives.refreshRemote();
	os.lastSyncAt = Date.now();
	const devices = result.devices?.devices || [];
	const previews = result.previews?.previews || [];
	os.recordGraphEvent("remote.refresh", {
		devices: devices.length,
		previews: previews.length
	});
	os.updateStatus(result.devices?.ok === false ? "needs-login" : "ready");
	os.taskbar.notify(`Remote drives: ${devices.length} vessels`, "success");
	return result;
}

/** @param {object} os Live OS facade. */
export async function createOsFile(os, { path, title, content = "" }) {
	await os.vfs.write(joinVfsPath(path, title), content, { userId: "current" });
	await os.showFilesAtPath({ path });
}

/** @param {object} os Live OS facade. */
export async function createOsFolder(os, { path, title }) {
	await os.vfs.mkdir(joinVfsPath(path, title), { userId: "current" });
	await os.showFilesAtPath({ path });
}

/** @param {object} os Live OS facade. */
export async function updateOsDefaultProgram(os, extension, programName) {
	if (!extension || !programName) {
		return;
	}
	defaultPrograms[extension] = programName;
	await SettingsManager.save(os.db, defaultPrograms);
}

/** @param {object} os Live OS facade. */
export async function showOsFilesAtPath(os, { path }) {
	os.currentPathForRefresh = path;
	os.damage.mark({
		x: 0,
		y: 0,
		width: innerWidth,
		height: innerHeight
	});
	os.recordGraphEvent("explorer.refresh", { path });
	if (path === "desktop.folder") {
		os.renderDesktop();
	}
}

/** @param {object} os Live OS facade. */
export function recordOsVfsMutation(os, event) {
	os.recentMutations.push(event);
	os.recentMutations = os.recentMutations.slice(-40);
	emitVfsMutation(os.graph, event);
	os.taskbar.notify(`VFS ${event.action}: ${event.path}`, "info");
	os.syncGraph();
}

function joinVfsPath(path = "/", title = "") {
	const base = String(path || "/");
	const tail = String(title || "")
		.split("/")
		.filter(Boolean)
		.join("/");
	if (base.startsWith("awtsmoos://")) {
		return `${base.replace(/\/+$/, "")}/${tail}`;
	}
	return `/${[base, tail].join("/").split("/").filter(Boolean).join("/")}`;
}
