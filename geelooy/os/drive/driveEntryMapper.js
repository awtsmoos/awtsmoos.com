//B"H
// Boruch Hashem
// Blessed is He
/**
 * @module DriveEntryMapper
 * @description Projects canonical Drive entry testimony into Geelooy OS VFS nodes.
 * The Awtsmoos remains beyond every descriptor; Awtsmoos.com preserves enough truth
 * that one file is still recognizably the same file in Drive and OS.
 */
import { DRIVE_MOUNT_PATH, driveVfsPath } from "./drivePath.js";

/** Returns a stable VFS directory node representing the signed-in Drive root. */
export function driveRootNode(aliasId = "") {
	return {
		name: "Awtsmoos Drive",
		path: DRIVE_MOUNT_PATH,
		type: "directory",
		provider: "drive",
		drivePath: "",
		aliasId
	};
}

/** Maps one backend Drive entry onto a provider-neutral VFS node. */
export function driveEntryNode(entry = {}, aliasId = "") {
	const drivePath = String(entry.path || entry.name || "").replace(/^\/+/, "");
	const type = entry.type === "folder" || entry.type === "directory" ? "directory" : "file";
	return {
		name: entry.name || drivePath.split("/").pop() || "",
		path: driveVfsPath(drivePath),
		type,
		provider: "drive",
		drivePath,
		aliasId,
		size: Number(entry.size || 0),
		visibility: entry.visibility || "private",
		mimeType: entry.mimeType || entry.mime || "",
		createdAt: entry.createdAt || null,
		updatedAt: entry.updatedAt || null,
		trashedAt: entry.trashedAt || null,
		cachePolicy: entry.cachePolicy || "mutable",
		semanticName: typeof entry.semanticName === "string" ? entry.semanticName : "",
		labels: Array.isArray(entry.labels)
			? entry.labels.filter(label => typeof label === "string")
			: []
	};
}

/** Extracts entry arrays across supported Drive response envelopes. */
export function driveEntriesFromResponse(response = {}) {
	if (Array.isArray(response.entries)) return response.entries;
	if (Array.isArray(response.success?.entries)) return response.success.entries;
	if (Array.isArray(response.success)) return response.success;
	return [];
}
