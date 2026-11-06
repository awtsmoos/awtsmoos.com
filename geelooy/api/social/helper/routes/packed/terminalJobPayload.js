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
	// Bulk-upload redesign §3.6: staged entries are the resume source —
	// they are lightweight manifest references, not a payload, and must
	// survive so a later resume can rebuild its entries. Only inline
	// post/update arrays are released.
	if (job.spec && (job.spec.stagedDir || (typeof job.spec.source === 'string' && job.spec.source.startsWith('upload:')))) return false;
	if (!job.spec || !Array.isArray(job.spec.posts) || job.spec.posts.length === 0) {
		if (job.spec && Array.isArray(job.spec.updates) && job.spec.updates.length > 0) {
			job.spec.updates = [];
			return true;
		}
		return false;
	}
	job.spec.posts = [];
	if (Array.isArray(job.spec.updates)) job.spec.updates = [];
	return true;
}

module.exports = {
	ACTIVE_STATUSES,
	releaseTerminalJobPayload
};
