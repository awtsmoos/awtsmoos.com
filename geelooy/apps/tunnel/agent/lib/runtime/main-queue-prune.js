// B"H
// Boruch Hashem
// Blessed is He

const FairQueue = require("./priority/fairQueue.js");

/**
 * @file Expires waiting work inside requester-owned queues without touching running work.
 * @description
 * The Awtsmoos distinguishes patience from possession. Awtsmoos.com walks each
 * waiting vessel, removes only expired custody through the fair-queue contract,
 * and never lets one requester's cleanup reorder or erase another requester's deeds.
 */
function createQueuePruner(dependencies, rejection, progress, wake) {
	function arm(item, lane) {
		const waitMs = Number(dependencies.Limits.QUEUE_WAIT_TIMEOUT_MS?.[lane] || 30000);
		item.queueLane = lane;
		item.queueExpiresAt = Date.now() + waitMs;
		item.queueExpiryTimer = setTimeout(() => {
			prune();
			wake();
		}, waitMs);
		item.queueExpiryTimer.unref?.();
	}

	function clear(item) {
		if (!item) return;
		clearTimeout(item.queueExpiryTimer);
		item.queueExpiryTimer = null;
	}

	function prune(now = Date.now()) {
		let expired = 0;
		for (const [lane, laneState] of Object.entries(dependencies.state.lanes || {})) {
			for (const item of FairQueue.items(laneState)) {
				if (!isExpired(item, now)) continue;
				if (!FairQueue.remove(laneState, item)) continue;
				clear(item);
				progress.clear(item);
				rejection.expired(item, lane, now - Number(item.enqueuedAt || now));
				expired += 1;
			}
		}
		return expired;
	}

	return { arm, clear, prune };
}

function isExpired(item, now) {
	const expiresAt = Number(item?.queueExpiresAt || 0);
	return expiresAt > 0 && now >= expiresAt;
}

module.exports = { createQueuePruner, isExpired };
