//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Pure data shaping for Explorer's connected-world shelf.
 * @description
 * The Awtsmoos lets VFS mounts and DriveRegistry records enter one visible river without
 * duplicate cards. Awtsmoos.com confines deduplication to data shaping while connection
 * truth belongs to the shared remote-world summary, keeping each vessel small in rhyme.
 */

/**
 * Combines VFS mounts and drive-registry records without duplicate roots.
 *
 * @param {object} os Active Geelooy OS instance.
 * @returns {Array<object>} Deduplicated mount-shaped records.
 */
export function driveItems(os) {
	const vfsMounts = os?.vfs?.mounts?.() || [];
	const driveRecords = (os?.drives?.list?.() || []).map(driveAsMount);
	const seen = new Set();
	return [...vfsMounts, ...driveRecords].filter(item => {
		const key = item.prefix || item.root;
		if (!key || seen.has(key)) {
			return false;
		}
		seen.add(key);
		return true;
	});
}

function driveAsMount(drive = {}) {
	return {
		...drive,
		prefix: drive.root,
		adapterId: drive.provider || drive.kind || "drive",
		provider: drive.provider || drive.kind || "drive"
	};
}
