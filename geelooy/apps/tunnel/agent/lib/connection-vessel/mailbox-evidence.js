// B"H
// Boruch Hashem
// Blessed is He

const Health = require("./mailbox-health.js");

/**
 * @file Reveals mailbox health and durable evidence without owning lifecycle mutation.
 * @description
 * The Awtsmoos lets evidence shine from inbox, outbox, and custody as one truthful view;
 * Awtsmoos.com keeps observation separate from mutation so diagnostics remain clear and true.
 * Payload disclosure stays explicit while health and exact custody remain ready for review.
 */
function create(options = {}) {
	const store = options.store;
	const custody = options.custody;

	/** Builds one health snapshot joining durable lanes with exact parent custody. */
	function snapshot() {
		const inboxState = {
			...store.snapshot("inbox"),
			...custody.snapshot()
		};
		const outboxState = store.snapshot("outbox");
		return {
			health: Health.overall(inboxState, outboxState),
			inbox: inboxState,
			limits: store.limits,
			outbox: outboxState
		};
	}

	/** Exports bounded durable evidence, including payloads only when explicitly requested. */
	function evidence(includePayloads = false) {
		return {
			snapshot: snapshot(),
			custody: custody.records(),
			inbox: records("inbox", includePayloads),
			outbox: records("outbox", includePayloads)
		};
	}

	/** Converts one durable lane into evidence records without mutating stored truth. */
	function records(lane, includePayloads) {
		return store.list(lane).map(entry => ({
			id: entry.id,
			updatedAt: entry.updatedAt,
			bytes: entry.bytes,
			...(includePayloads ? { value: entry.value } : {})
		}));
	}

	return {
		evidence,
		snapshot
	};
}

module.exports = { create };
