//B"H
// Boruch Hashem
// Blessed is He
/**
 * @module DriveTransport
 * @description Explicit resource operations for the canonical Awtsmoos Drive service.
 * The Awtsmoos lets one backend answer many surfaces; Awtsmoos.com keeps each call
 * named by alias and path so no browser UI state can secretly steer the OS.
 */
import { DRIVE_API_ROOT, requestDriveBytes, requestDriveJson, uploadDriveBytes } from "./driveRequest.js";
import { encodeDriveEntryPath } from "./drivePath.js";

/** Lists direct children for one canonical Drive directory path. */
export function listDriveEntries(aliasId, path = "", options = {}) {
	const query = new URLSearchParams({
		path,
		search: options.search || "",
		type: options.type || "",
		visibility: options.visibility || "",
		includeTrash: String(Boolean(options.includeTrash)),
		sort: options.sort || "path",
		direction: options.direction || "asc",
		limit: String(options.limit || 100)
	});
	return requestDriveJson(`${aliasBase(aliasId)}/entries?${query}`);
}

/** Creates one Drive entry, normally a folder, with explicit metadata. */
export function createDriveEntry(aliasId, values) {
	return requestDriveJson(`${aliasBase(aliasId)}/entries`, {
		method: "POST",
		values
	});
}

/** Updates metadata for one existing Drive entry. */
export function updateDriveEntry(aliasId, path, values) {
	return requestDriveJson(entryUrl(aliasId, path), {
		method: "PUT",
		values
	});
}

/** Runs one native Drive action such as move, copy, trash, or restore. */
export function runDriveAction(aliasId, action, values) {
	return requestDriveJson(`${aliasBase(aliasId)}/actions/${encodeURIComponent(action)}`, {
		method: "POST",
		values
	});
}

/** Reads one authenticated private Drive file as raw bytes. */
export function readDriveBytes(aliasId, path) {
	return requestDriveBytes(entryUrl(aliasId, path));
}

/** Writes/replaces one Drive file through the service streaming endpoint. */
export function writeDriveBytes(aliasId, path, payload = {}) {
	const encodedAlias = encodeURIComponent(aliasId);
	const encodedPath = encodeDriveEntryPath(path);
	return uploadDriveBytes(`${DRIVE_API_ROOT}/${encodedAlias}/stream/${encodedPath}`, payload);
}

/** Returns the canonical public URL for one Drive file. */
export function drivePublicUrl(aliasId, path) {
	const encodedAlias = encodeURIComponent(aliasId);
	return `${location.origin}${DRIVE_API_ROOT}/public/${encodedAlias}/${encodeDriveEntryPath(path)}`;
}

function aliasBase(aliasId) {
	return `${DRIVE_API_ROOT}/aliases/${encodeURIComponent(aliasId)}`;
}

function entryUrl(aliasId, path) {
	return `${aliasBase(aliasId)}/entry/${encodeDriveEntryPath(path)}`;
}
