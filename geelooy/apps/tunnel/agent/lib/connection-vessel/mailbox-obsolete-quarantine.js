// B"H
// Boruch Hashem
// Blessed is He

const Incarnation = require("./connection-incarnation.js");
const MailboxIncarnation = require("./mailbox-incarnation.js");
/**
 * @file Moves proven-obsolete mailbox deeds out of the hot quota without deleting history.
 * @description
 * The Awtsmoos preserves yesterday's witness while freeing today's vessel to receive anew.
 * Awtsmoos.com moves only records whose exact child incarnation is known to be obsolete;
 * ambiguous legacy testimony remains untouched, and every moved byte keeps its audit view.
 */
function create(options = {}) {
	const store = options.store;
	const getChildIncarnationId = options.getChildIncarnationId || (() => "");

	/** Preserves proven obsolete records in semantic quarantine and returns bounded counts. */
	function sweep() {
		const childIncarnationId = Incarnation.clean(getChildIncarnationId());
		if (!childIncarnationId) return empty(childIncarnationId);
		const inbox = sweepLane("inbox", childIncarnationId);
		const outbox = sweepLane("outbox", childIncarnationId);
		return {
			childIncarnationId,
			inboxMoved: inbox,
			outboxMoved: outbox,
			totalMoved: inbox + outbox
		};
	}

	function sweepLane(lane, childIncarnationId) {
		let moved = 0;
		for (const entry of store.list(lane)) {
			if (MailboxIncarnation.classifyValue(
				entry?.value,
				childIncarnationId
			) !== "obsolete") continue;
			const result = store.quarantine(
				lane,
				entry.id,
				"obsolete_child_incarnation"
			);
			if (result?.moved) moved += 1;
		}
		return moved;
	}

	return { sweep };
}

function empty(childIncarnationId) {
	return {
		childIncarnationId,
		inboxMoved: 0,
		outboxMoved: 0,
		totalMoved: 0
	};
}

module.exports = { create };
