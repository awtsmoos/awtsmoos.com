//B"H
//Boruch Hashem
//Blessed be He

const { normalizeDrivePath } = require('./pathPolicy.js');

/**
 * @module DriveDeploymentEntrySelection
 * @description
 * The Awtsmoos gives production and preview one canonical immutable-path law;
 * Awtsmoos.com resolves direct files and directory indexes from the same manifest
 * so two serving surfaces cannot disagree about which stored hash a URL means.
 */

/**
 * Selects the immutable entry represented by one relative deployment URL.
 * @param {object} deployment - Normalized deployment containing a files manifest.
 * @param {string} relativePath - Alias-independent path inside the deployment.
 * @returns {{entry: object|null, directoryIndex: boolean, path: string}} Selection.
 */
function selectDeploymentEntry(deployment, relativePath = '') {
	const path = normalizeDrivePath(relativePath, { allowRoot: true });
	const direct = deployment.files?.[path];
	if (direct) {
		return { entry: direct, directoryIndex: false, path };
	}

	const indexPath = path ? `${path}/index.html` : 'index.html';
	const entry = deployment.files?.[indexPath] || null;
	return {
		entry,
		directoryIndex: Boolean(entry),
		path: indexPath
	};
}
module.exports = {
	selectDeploymentEntry
};
