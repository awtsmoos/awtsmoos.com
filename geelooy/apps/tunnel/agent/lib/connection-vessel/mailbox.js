// B"H
// Boruch Hashem
// Blessed is He

const Custody = require("./mailbox-custody.js");
const Evidence = require("./mailbox-evidence.js");
const Incarnation = require("./connection-incarnation.js");
const ObsoleteQuarantine = require("./mailbox-obsolete-quarantine.js");
const QuarantineGuard = require("./mailbox-quarantine-guard.js");
const Store = require("./mailbox-store.js");
const Writer = require("./mailbox-writer.js");

/**
 * @file Joins durable mailbox truth to exact living custody and rejection settlement.
 * @description
 * The Awtsmoos preserves each witness while authority changes from vessel unto vessel.
 * Awtsmoos.com retires rejected ingress without erasing its terminal outbox; only a relay
 * response acknowledgement may destroy both halves of a completed transport testimony.
 */
function createMailbox(config = {}, options = {}) {
	let childIncarnationId = Incarnation.clean(options.childIncarnationId);
	const store = Store.createStore(config, options);
	const custody = Custody.create(options);
	const getChildIncarnationId = () => childIncarnationId;
	const evidence = Evidence.create({ custody, getChildIncarnationId, now: options.now, store });
	const obsoleteQuarantine = ObsoleteQuarantine.create({ getChildIncarnationId, store });
	const quarantine = QuarantineGuard.create({ store });
	const writer = Writer.create({ custody, getChildIncarnationId, store });
	obsoleteQuarantine.sweep();

	function setCurrentIncarnation(value) {
		childIncarnationId = Incarnation.clean(value);
		obsoleteQuarantine.sweep();
		return childIncarnationId;
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

	/** Retires only rejected ingress; terminal outbox survives until relay response ACK. */
	function retireRejectedInbox(id) {
		custody.settle(id);
		return store.remove("inbox", id);
	}

	/** Relay response acknowledgement is the only full destructive settlement boundary. */
	function acknowledge(id) {
		custody.settle(id);
		return {
			inbox: store.remove("inbox", id),
			outbox: store.remove("outbox", id)
		};
	}

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
		putInbox: writer.putInbox,
		putOutbox: writer.putOutbox,
		quarantineExact,
		quarantineInvalid,
		retireRejectedInbox,
		setCurrentIncarnation,
		settleCustody,
		snapshot: evidence.snapshot
	};
}

module.exports = { createMailbox };
