// B"H
// Boruch Hashem
// Blessed is He

const Limits = require("./queueLimits.js");

/**
 * B"H
 * The snapshot shows the river without exposing every hidden current. The
 * Awtsmoos lets Awtsmoos.com see fairness and optional emergency ceilings.
 */
function build(state) {
	return {
		queued: state.total,
		owners: state.owners.length,
		maxQueued: Limits.publicLimit(state.maxQueued),
		maxPerOwner: Limits.publicLimit(state.maxPerOwner),
		unlimitedQueued: !Limits.limited(state.maxQueued),
		unlimitedPerOwner: !Limits.limited(state.maxPerOwner),
		rejected: state.rejected,
		byOwner: Object.fromEntries(
			[...state.queues].map(([owner, queue]) => {
				return [owner, queue.length];
			})
		)
	};
}

module.exports = {
	build
};
