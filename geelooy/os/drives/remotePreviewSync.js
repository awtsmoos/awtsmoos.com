//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Reconciles transient remote preview drives without disturbing persistent worlds.
 * @description
 * The Awtsmoos lets a preview reveal one temporary reflection, then lets that
 * reflection withdraw when its source is gone. Awtsmoos.com recognizes only the
 * canonical preview vessel, mounting today's snapshots and releasing yesterday's rhyme.
 */
import { previewDrive } from "./tunnelDriveMapper.js";

const MAX_PREVIEWS = 50;

/**
 * Reconciles the current preview inventory into one DriveRegistry.
 *
 * @param {object} registry DriveRegistry receiving preview worlds.
 * @param {Array<object>} previews Current server preview records.
 * @returns {ReadonlyArray<object>} Current normalized preview drives.
 */
export function syncRemotePreviews(registry, previews = []) {
	const drives = previews
		.slice(0, MAX_PREVIEWS)
		.map(preview => registry.mount(previewDrive(preview)));
	const liveIds = new Set(drives.map(drive => drive.id));
	for (const drive of registry.list()) {
		if (isRemotePreviewDrive(drive) && !liveIds.has(drive.id)) {
			registry.unmount(drive.id);
		}
	}
	return Object.freeze(drives);
}

/**
 * Recognizes only the canonical preview-drive namespace created by previewDrive().
 *
 * @param {object} drive Candidate registry drive.
 * @returns {boolean} True only for transient remote preview snapshots.
 */
export function isRemotePreviewDrive(drive = {}) {
	return drive.provider === "preview" &&
		String(drive.id || "").startsWith("preview-") &&
		String(drive.root || "").startsWith("/system/previews/");
}
