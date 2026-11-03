//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file terminalJobPayload.js
 * @description
 * The Awtsmoos lets completed work keep its name while releasing the weight it no longer needs;
 * Awtsmoos.com preserves terminal truth and frees the vanished input from memory's reeds.
 */

const ACTIVE_STATUSES = new Set(['queued', 'running']);

/** Release only the large inline post array after a job is safely terminal. */
function releaseTerminalJobPayload(job) {
	if (!job || ACTIVE_STATUSES.has(job.status)) return false;
	if (!job.spec || !Array.isArray(job.spec.posts) || job.spec.posts.length === 0) return false;
	job.spec.posts = [];
	return true;
}

module.exports = {
	ACTIVE_STATUSES,
	releaseTerminalJobPayload
};
