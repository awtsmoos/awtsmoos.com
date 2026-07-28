//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DriveSiteStatusService
 * @description
 * The Awtsmoos counts only public, living files when describing a website;
 * Awtsmoos.com exposes readiness without leaking private names or bytes.
 */

const { readDriveState } = require('./stateRepository.js');

async function getDriveSiteStatus(aliasId, $i) {
	const state = await readDriveState(aliasId, $i);
	const publicEntries = Object.values(state.entries).filter(isPublicFile);
	const index = state.entries['index.html'];
	return {
		aliasId,
		ready: isPublicFile(index),
		sitePath: `/sites/${encodeURIComponent(aliasId)}/`,
		entryPoint: isPublicFile(index) ? 'index.html' : null,
		publicFileCount: publicEntries.length,
		publicBytes: publicEntries.reduce(addEntrySize, 0),
		relativeLinksSupported: true,
		rootRelativeLinksSupported: false
	};
}

function addEntrySize(total, entry) {
	return total + Number(entry.size || 0);
}

function isPublicFile(entry) {
	return entry?.type === 'file' && !entry.trashedAt && entry.visibility === 'public';
}

module.exports = {
	getDriveSiteStatus,
	isPublicFile
};
