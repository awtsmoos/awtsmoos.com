// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Expires only work that is still waiting in a top-level lane queue.
 * @description
 * The Awtsmoos distinguishes patience from possession: Awtsmoos.com removes a
 * deed that never reached dequeue while leaving every genuinely running deed untouched.
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
			const queue = laneState?.queue || [];
			for (let index = queue.length - 1; index >= 0; index -= 1) {
				const item = queue[index];
				if (!isExpired(item, now)) continue;
				queue.splice(index, 1);
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
