// B"H

/** Computes changed-file plans and three-way conflicts from immutable manifests. */
export function planPush(local, remote, deleteMissing = false) {
	return {
		upload: changed(local.files, remote.files),
		removeRemote: deleteMissing ? missing(remote.files, local.files) : []
	};
}

export function planPull(local, remote, deleteMissing = false) {
	return {
		download: changed(remote.files, local.files),
		removeLocal: deleteMissing ? missing(local.files, remote.files) : []
	};
}

export function planSync(base, local, remote) {
	const upload = [];
	const download = [];
	const conflicts = [];
	const paths = new Set([
		...Object.keys(base.files || {}),
		...Object.keys(local.files || {}),
		...Object.keys(remote.files || {})
	]);
	for (const path of paths) {
		const baseHash = base.files?.[path]?.sha256 || null;
		const localHash = local.files?.[path]?.sha256 || null;
		const remoteHash = remote.files?.[path]?.sha256 || null;
		const localChanged = localHash !== baseHash;
		const remoteChanged = remoteHash !== baseHash;
		if (localHash === remoteHash) continue;
		if (localChanged && remoteChanged) conflicts.push(path);
		else if (localChanged) upload.push(path);
		else if (remoteChanged) download.push(path);
	}
	return { upload, download, conflicts };
}

function changed(source = {}, target = {}) {
	return Object.keys(source).filter(path => source[path].sha256 !== target[path]?.sha256);
}

function missing(source = {}, target = {}) {
	return Object.keys(source).filter(path => !target[path]);
}
