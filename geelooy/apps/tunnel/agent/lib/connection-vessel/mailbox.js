// B"H
// Boruch Hashem
// Blessed is He

const Custody = require("./mailbox-custody.js");
const Evidence = require("./mailbox-evidence.js");
const Protocol = require("./protocol.js");
const QuarantineGuard = require("./mailbox-quarantine-guard.js");
const Store = require("./mailbox-store.js");

/**
 * @file Joins durable mailbox truth to exact living custody and acknowledgement.
 * @description
 * The Awtsmoos preserves each result before changing the story of its living deed;
 * Awtsmoos.com keeps valid testimony from quarantine until durable retirement proof takes seed.
 * Relay acknowledgement alone may settle and remove the witness once delivery is agreed.
 */
function createMailbox(config = {}, options = {}) {
	const store = Store.createStore(config, options);
	const custody = Custody.create(options);
	const evidence = Evidence.create({ store, custody });
	const quarantine = QuarantineGuard.create({ store });

	function putInbox(envelope) {
		const id = Protocol.requestId(envelope);
		store.put("inbox", id, envelope);
		return id;
	}

	/** Persists terminal truth first, then advances custody to acknowledgement debt. */
	function putOutbox(envelope) {
		const id = Protocol.requestId(envelope);
		const value = {
			...envelope,
			transportReceiptId: envelope.transportReceiptId || id
		};
		store.put("outbox", id, value);
		custody.progress(id, {
			phase: "result_waiting_for_ack",
			resultState: "result_waiting_for_ack"
		});
		return value;
	}

	function noteDeliveryAttempt(id, metadata = {}) {
		return custody.noteAttempt(id, metadata);
	}

	function noteParentCustody(id, metadata = {}) {
		return custody.noteParent(id, metadata);
	}

	function noteCustodyProgress(id, metadata = {}) {
		return custody.progress(id, metadata);
	}

	function settleCustody(id) {
		return custody.settle(id);
	}

	/** Relay response acknowledgement is the destructive settlement boundary. */
	function acknowledge(id) {
		custody.settle(id);
		return {
			inbox: store.remove("inbox", id),
			outbox: store.remove("outbox", id)
		};
	}

	/** Valid executable testimony is preserved until durable retirement proof exists. */
	function quarantineExact(id, reason = "semantic_stale_custody") {
		return quarantine.quarantineExact(id, reason);
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

	function quarantineInvalid() {
		return {
			inbox: store.quarantineInvalid("inbox"),
			outbox: store.quarantineInvalid("outbox")
		};
	}

	return {
		acknowledge,
		evidence: evidence.evidence,
		inbox,
		noteCustodyProgress,
		noteDeliveryAttempt,
		noteParentCustody,
		outbox,
		outboxOne,
		putInbox,
		putOutbox,
		quarantineExact,
		quarantineInvalid,
		settleCustody,
		snapshot: evidence.snapshot
	};
}

module.exports = { createMailbox };
