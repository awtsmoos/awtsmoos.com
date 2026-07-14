// B"H
// Boruch Hashem
// Blessed is He
/** @module JobLineage @description Preserves immutable ancestry across retries, replay, and cancellation. */

/** Creates one job-lineage node. */
export function createJobLineage(input) {
	const jobId = String(input?.jobId || '').trim();
	if (!jobId) {
		throw new TypeError('Job lineage requires jobId.');
	}
	return Object.freeze({
		jobId,
		parentJobId: input?.parentJobId || null,
		rootJobId: input?.rootJobId || input?.parentJobId || jobId,
		action: String(input?.action || ''),
		ownerId: String(input?.ownerId || ''),
		inputHash: String(input?.inputHash || ''),
		reason: String(input?.reason || 'original'),
		createdAt: String(input?.createdAt || new Date().toISOString())
	});
}

/** Returns the complete root-to-leaf lineage when nodes are available. */
export function traceJobLineage(jobId, nodes) {
	const byId = new Map(nodes.map(node => [node.jobId, node]));
	const path = [];
	let current = byId.get(jobId);
	while (current) {
		path.unshift(current);
		current = current.parentJobId ? byId.get(current.parentJobId) : null;
	}
	return Object.freeze(path);
}
