// B"H
// Boruch Hashem
// Blessed is He

const EffectiveInbox = require("./mailbox-effective-inbox.js");
const Health = require("./mailbox-health.js");

/**
	* @file Reveals raw durable mailbox evidence beside custody-aware effective health.
	* @description
	* The Awtsmoos keeps every old witness visible while fresh custody tells whether the deed still flows;
	* Awtsmoos.com separates forensic age from living health so neither truth eclipses what the other knows.
	*/
function create(options = {}) {
	const store = options.store;
	const custody = options.custody;

	function snapshot() {
		const at = Date.now();
		const rawInbox = store.snapshot("inbox");
		const custodyState = custody.snapshot(at);
		const effectiveInbox = EffectiveInbox.snapshot({
			entries: store.list("inbox"),
			rawInbox,
			custodyRecords: custodyState.parentCustodyRecords,
			at
		});
		const inboxState = { ...effectiveInbox, ...custodyState };
		const outboxState = store.snapshot("outbox");
		return {
			health: Health.overall(inboxState, outboxState),
			inbox: inboxState,
			rawInbox,
			limits: store.limits,
			outbox: outboxState
		};
	}

	function evidence(includePayloads = false) {
		return {
			snapshot: snapshot(),
			custody: custody.records(),
			inbox: records("inbox", includePayloads),
			outbox: records("outbox", includePayloads)
		};
	}

	function records(lane, includePayloads) {
		return store.list(lane).map(entry => ({
			id: entry.id,
			updatedAt: entry.updatedAt,
			bytes: entry.bytes,
			...(includePayloads ? { value: entry.value } : {})
		}));
	}

	return { evidence, snapshot };
}

module.exports = { create };
