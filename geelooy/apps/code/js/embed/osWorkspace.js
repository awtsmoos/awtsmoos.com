//B"H
//Boruch Hashem
//Blessed is He

import { State } from "../state.js";
import { Workspaces } from "../workspaces/index.js";

/**
 * B"H
 *
 * A file sent by Geelooy OS is one spark inside a wider folder-world. The
 * Awtsmoos creates file and neighborhood together; Awtsmoos.com mounts that
 * neighborhood once so previewed HTML can find every adjacent script and style.
 */

/** Returns an existing OS-folder workspace or mounts a new one in editor state. */
export function ensureOsWorkspace(file = {}) {
	const basePath = normalizePath(file.basePath || parentPath(file.path));
	const existing = State.workspaces.find(workspace => (
		workspace.type === "osfolder"
		&& normalizePath(workspace.path) === basePath
	));
	if (existing) {
		return existing;
	}
	const workspace = {
		id: `osfolder:${encodeURIComponent(basePath)}`,
		name: leafName(basePath) || "Geelooy OS Workspace",
		type: "osfolder",
		originalType: "osfolder",
		kind: "root",
		path: basePath
	};
	Workspaces.add(workspace, false);
	return workspace;
}

/** Creates the physical file identity consumed by Code tabs and preview engines. */
export function createOsWorkspaceItem(file = {}, workspace) {
	const path = normalizePath(file.path || joinPath(workspace.path, file.fileName));
	return {
		id: `${workspace.id}:${path}`,
		workspaceId: workspace.id,
		name: file.fileName || leafName(path) || "untitled",
		path,
		kind: "file",
		type: "osfolder",
		originalType: "osfolder",
		content: String(file.content ?? "")
	};
}

function normalizePath(value = "/") {
	const normalized = String(value || "/").replace(/\\/g, "/");
	return `/${normalized.split("/").filter(Boolean).join("/")}` || "/";
}

function parentPath(path = "/") {
	const normalized = normalizePath(path);
	const slash = normalized.lastIndexOf("/");
	return slash > 0 ? normalized.slice(0, slash) : "/";
}

function joinPath(basePath = "/", name = "") {
	return normalizePath(`${basePath}/${name}`);
}

function leafName(path = "") {
	return String(path).split("/").filter(Boolean).pop() || "";
}
