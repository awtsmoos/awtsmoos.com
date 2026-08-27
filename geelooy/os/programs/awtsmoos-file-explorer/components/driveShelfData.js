//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Pure data shaping for Explorer's connected-world shelf.
 * @description
 * The Awtsmoos lets VFS mounts and DriveRegistry records enter one visible river
 * without duplicate cards. Awtsmoos.com keeps deduplication and connection copy
 * outside DOM creation so data truth stays small, testable, and clear in rhyme.
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

export function statusCopy(state = {}) {
	if (state.status === "loading") {
		return "Refreshing connections…";
	}
	if (state.status === "error") {
		return "Remote refresh issue";
	}
	const count = state.driveIds?.length || 0;
	return `${count} connected computer${count === 1 ? "" : "s"}`;
}

function driveAsMount(drive = {}) {
	return {
		...drive,
		prefix: drive.root,
		adapterId: drive.provider || drive.kind || "drive",
		provider: drive.provider || drive.kind || "drive"
	};
}
