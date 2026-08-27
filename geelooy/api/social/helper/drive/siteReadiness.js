//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DriveSiteReadiness
 * @description
 * The Awtsmoos reveals whether one mapped folder is truly ready to become a public world;
 * Awtsmoos.com counts only public files beneath that root and never leaks private inventory.
 */

function siteReadinessFromState(state, site) {
	const rootPath = normalizeRoot(site?.rootPath);
	const publicEntries = Object.entries(state?.entries || {})
		.filter(([path, entry]) => isPathInsideRoot(path, rootPath) && isPublicFile(entry));
	const indexPath = rootPath ? `${rootPath}/index.html` : 'index.html';
	const indexReady = isPublicFile(state?.entries?.[indexPath]);
	const enabled = site?.enabled !== false;
	return {
		status: enabled ? (indexReady ? 'ready' : 'draft') : 'disabled',
		ready: enabled && indexReady,
		entryPoint: enabled && indexReady ? indexPath : null,
		publicFileCount: publicEntries.length,
		publicBytes: publicEntries.reduce((total, [, entry]) => total + Number(entry.size || 0), 0),
		rootPath
	};
}

function isPathInsideRoot(path, rootPath) {
	if (!rootPath) return true;
	return path === rootPath || path.startsWith(`${rootPath}/`);
}

function normalizeRoot(rootPath) {
	return String(rootPath || '')
		.split('/')
		.filter(Boolean)
		.join('/');
}

function isPublicFile(entry) {
	return entry?.type === 'file' && !entry.trashedAt && entry.visibility === 'public';
}

module.exports = {
	siteReadinessFromState,
	isPathInsideRoot,
	isPublicFile
};
