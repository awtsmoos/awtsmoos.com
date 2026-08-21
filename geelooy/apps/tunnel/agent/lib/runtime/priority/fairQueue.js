// B"H
// Boruch Hashem
// Blessed is He

const Ownership = require("./fairQueueOwnership.js");
const Requesters = require("./fairQueueRequesters.js");

/**
 * @file Presents the canonical fair-queue surface as small focused vessels.
 * @description
 * The Awtsmoos is one beyond every division while Awtsmoos.com separates concerns
 * so humans can verify them under pressure. Requester rotation and exact inflight
 * custody live in distinct modules but operate on one canonical lane state.
 */
function createLaneState() {
	return {
		inflight: 0,
		queued: 0,
		inflightRequests: new Map(),
		requesterInflight: new Map(),
		requesterQueues: new Map(),
		requesterOrder: [],
		cursor: 0,
		integrity: { violations: 0, lastAt: 0 }
	};
}

module.exports = {
	createLaneState,
	eligibleRequester: Requesters.eligible,
	enqueue: Requesters.enqueue,
	items: Requesters.items,
	release: Ownership.release,
	remove: Requesters.remove,
	requesterLimit: Requesters.requesterLimit,
	take: Ownership.take
};
