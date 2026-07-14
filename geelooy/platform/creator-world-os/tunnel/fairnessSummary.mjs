// B"H
// Boruch Hashem
// Blessed is He
/** @module FairnessSummary @description Summarizes queue service without hiding requester pressure. */

/** Creates a fairness summary grouped by requester and lane. */
export function createFairnessSummary(jobs) {
	const requesters = {};
	const lanes = {};
	for (const job of jobs) {
		const requester = String(job.requesterId || 'unknown');
		const lane = String(job.lane || 'unknown');
		requesters[requester] ||= { queued: 0, active: 0, completed: 0, failed: 0 };
		requesters[requester][job.state] = (requesters[requester][job.state] || 0) + 1;
		lanes[lane] ||= { queued: 0, active: 0, completed: 0, failed: 0 };
		lanes[lane][job.state] = (lanes[lane][job.state] || 0) + 1;
	}
	return Object.freeze({
		requesters: freezeNested(requesters),
		lanes: freezeNested(lanes),
		total: jobs.length
	});
}

function freezeNested(value) {
	for (const child of Object.values(value)) {
		Object.freeze(child);
	}
	return Object.freeze(value);
}
