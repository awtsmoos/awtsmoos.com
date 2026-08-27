// B"H
// Boruch Hashem
// Blessed is He

const Health = require("./mailbox-health.js");
const Protocol = require("./protocol.js");
const Store = require("./mailbox-store.js");

/**
 * @file Gives transport testimony durable settlement and generation-local custody.
 * @description
 * The Awtsmoos preserves accepted deeds on disk while current parent custody lives in measured time;
 * Awtsmoos.com may replay an ancient witness without mistaking its age for the age of today's living hand.
 */
function createMailbox(config = {}, options = {}) {
	const store = Store.createStore(config, options);
	const now = options.now || Date.now;
	const parentCustody = new Map();

	function putInbox(envelope) {
		const id = Protocol.requestId(envelope);
		store.put("inbox", id, envelope);
		return id;
	}

	function putOutbox(envelope) {
		const id = Protocol.requestId(envelope);
		const value = { ...envelope, transportReceiptId: envelope.transportReceiptId || id };
		store.put("outbox", id, value);
		return value;
	}

	function noteParentCustody(id) {
		const receiptId = String(id || "").trim();
		if (!receiptId) return false;
		parentCustody.set(receiptId, now());
		return true;
	}

	function acknowledge(id) {
		parentCustody.delete(String(id || ""));
		return {
			inbox: store.remove("inbox", id),
			outbox: store.remove("outbox", id)
		};
	}

	function inbox() {
		return store.list("inbox").map(entry => entry.value);
	}

	function outbox() {
		return store.list("outbox").map(entry => entry.value);
	}

	function outboxOne(id) {
		return store.get("outbox", id)?.value || null;
	}

	function snapshot() {
		const inboxState = {
			...store.snapshot("inbox"),
			...custodySnapshot()
		};
		const outboxState = store.snapshot("outbox");
		return {
			health: Health.overall(inboxState, outboxState),
			inbox: inboxState,
			limits: store.limits,
			outbox: outboxState
		};
	}

	function custodySnapshot() {
		const acceptedTimes = [...parentCustody.values()].filter(Number.isFinite);
		const oldestAt = acceptedTimes.length ? Math.min(...acceptedTimes) : 0;
		return {
			parentCustodyCount: parentCustody.size,
			parentCustodyOldestAt: oldestAt || null,
			parentCustodyOldestAgeMs: oldestAt ? Math.max(0, now() - oldestAt) : 0
		};
	}

	function evidence(includePayloads = false) {
		return {
			snapshot: snapshot(),
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

	function quarantineInvalid() {
		return {
			inbox: store.quarantineInvalid("inbox"),
			outbox: store.quarantineInvalid("outbox")
		};
	}

	return {
		acknowledge,
		evidence,
		inbox,
		noteParentCustody,
		outbox,
		outboxOne,
		putInbox,
		putOutbox,
		quarantineInvalid,
		snapshot
	};
}

module.exports = { createMailbox };
