//B"H
// Boruch Hashem
// Blessed is He
/**
 * @module DrivePath
 * @description Maps Geelooy OS `/drive` paths to canonical Awtsmoos Drive entry paths.
 * The Awtsmoos is one beneath every doorway; Awtsmoos.com lets OS and Drive name
 * the same object without copying it into a second world.
 */
export const DRIVE_MOUNT_PATH = "/drive";

/** Returns the backend Drive path for one full VFS path beneath `/drive`. */
export function driveEntryPath(vfsPath = DRIVE_MOUNT_PATH) {
	const normalized = normalizeVfsPath(vfsPath);
	if (normalized === DRIVE_MOUNT_PATH) return "";
	if (!normalized.startsWith(`${DRIVE_MOUNT_PATH}/`)) {
		throw new Error(`Path is outside Awtsmoos Drive: ${vfsPath}`);
	}
	return normalizeEntryPath(normalized.slice(DRIVE_MOUNT_PATH.length + 1));
}

/** Returns the full OS VFS path for one canonical Drive entry path. */
export function driveVfsPath(entryPath = "") {
	const normalized = normalizeEntryPath(entryPath);
	return normalized ? `${DRIVE_MOUNT_PATH}/${normalized}` : DRIVE_MOUNT_PATH;
}

/** Encodes canonical Drive path segments while preserving folder separators. */
export function encodeDriveEntryPath(entryPath = "") {
	return normalizeEntryPath(entryPath)
		.split("/")
		.filter(Boolean)
		.map(segment => encodeURIComponent(segment))
		.join("/");
}

/** Returns the canonical parent Drive path. */
export function parentDriveEntryPath(entryPath = "") {
	const parts = normalizeEntryPath(entryPath).split("/").filter(Boolean);
	parts.pop();
	return parts.join("/");
}

function normalizeVfsPath(value) {
	const clean = String(value || "/").replace(/\\/g, "/").replace(/\/+/g, "/");
	return clean.length > 1 ? clean.replace(/\/$/, "") : clean;
}

function normalizeEntryPath(value) {
	const parts = String(value || "").replace(/\\/g, "/").split("/").filter(Boolean);
	if (parts.some(part => part === "." || part === "..")) {
		throw new Error("Drive path traversal is not allowed.");
	}
	return parts.join("/");
}
