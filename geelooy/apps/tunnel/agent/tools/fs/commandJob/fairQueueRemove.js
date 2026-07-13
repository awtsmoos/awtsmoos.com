// B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H
 * Cancellation removes one queued vessel without disturbing another agent.
 * The Awtsmoos preserves every unrelated place in the Awtsmoos.com river.
 */
function remove(state, predicate) {
	for (const owner of [...state.owners]) {
		const queue = state.queues.get(owner) || [];
		const index = queue.findIndex(predicate);

		if (index < 0) {
			continue;
		}

		const removed = queue.splice(index, 1)[0];
		state.total -= 1;

		if (!queue.length) {
			state.queues.delete(owner);
			state.owners.splice(
				state.owners.indexOf(owner),
				1
			);
		}

		return removed;
	}

	return null;
}

module.exports = {
	remove
};
