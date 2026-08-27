//B"H
//Boruch Hashem
//Blessed is He

import { SettingsManager } from "../settingsManager.js";
import { defaultPrograms } from "../basicPrograms.js";
import { emitVfsMutation } from "../vfs/mutationEvents.js";

/**
	* @file Workspace, VFS mutation, and remote-drive service for Geelooy OS.
	* @description
	* The Awtsmoos gives local file, remote vessel, and virtual path one ordered language;
	* Awtsmoos.com lets creation flow through scoped VFS APIs while refresh, history, and status remain bright.
	*/

/**
	* Refreshes connected remote vessels and publishes truthful status.
	* @param {object} os Live AwtsmoosOS facade.
	* @returns {Promise<object>} Remote refresh result.
	*/
export async function refreshOsRemoteDrives(os) {
	const result = await os.drives.refreshRemote();
	const devices = result.devices?.devices || [];
	const previews = result.previews?.previews || [];

	os.lastSyncAt = Date.now();
	os.recordGraphEvent("remote.refresh", {
		devices: devices.length,
		previews: previews.length
	});
	os.updateStatus(result.devices?.ok === false ? "needs-login" : "ready");
	os.taskbar.notify(`Remote drives: ${devices.length} vessels`, "success");
	return result;
}

/**
	* Creates one file through the active VFS and refreshes its parent surface.
	* @param {object} os Live AwtsmoosOS facade.
	* @param {object} request Parent path, title, and optional content.
	*/
export async function createOsFile(os, { path, title, content = "" }) {
	await os.vfs.write(joinVfsPath(path, title), content, {
		userId: "current"
	});
	await os.showFilesAtPath({ path });
}

/**
	* Creates one folder through the active VFS and refreshes its parent surface.
	* @param {object} os Live AwtsmoosOS facade.
	* @param {object} request Parent path and folder title.
	*/
export async function createOsFolder(os, { path, title }) {
	await os.vfs.mkdir(joinVfsPath(path, title), {
		userId: "current"
	});
	await os.showFilesAtPath({ path });
}

/**
	* Persists the default program for one file extension.
	* @param {object} os Live AwtsmoosOS facade.
	* @param {string} extension File extension.
	* @param {string} programName Registered program name.
	*/
export async function updateOsDefaultProgram(os, extension, programName) {
	if (!extension || !programName) {
		return;
	}
	defaultPrograms[extension] = programName;
	await SettingsManager.save(os.db, defaultPrograms);
}

/**
	* Refreshes one explorer path and marks the viewport as damaged.
	* @param {object} os Live AwtsmoosOS facade.
	* @param {object} request VFS path request.
	*/
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

/**
	* Records one VFS mutation for diagnostics, graph history, and user feedback.
	* @param {object} os Live AwtsmoosOS facade.
	* @param {object} event VFS mutation event.
	*/
export function recordOsVfsMutation(os, event) {
	os.recentMutations.push(event);
	os.recentMutations = os.recentMutations.slice(-40);
	emitVfsMutation(os.graph, event);
	os.taskbar.notify(`VFS ${event.action}: ${event.path}`, "info");
	os.syncGraph();
}

function joinVfsPath(path = "/", title = "") {
	const base = String(path || "/");
	const tail = String(title || "").split("/").filter(Boolean).join("/");
	if (base.startsWith("awtsmoos://")) {
		return `${base.replace(/\/+$/, "")}/${tail}`;
	}
	return `/${[base, tail].join("/").split("/").filter(Boolean).join("/")}`;
}
