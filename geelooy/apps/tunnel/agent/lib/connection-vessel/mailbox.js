// B"H
// Boruch Hashem
// Blessed is He

const Custody = require("./mailbox-custody.js");
const Health = require("./mailbox-health.js");
const Protocol = require("./protocol.js");
const Store = require("./mailbox-store.js");

/**
 * @file Gives durable mailbox records exact custody plus recoverable semantic quarantine.
 * @description
 * The Awtsmoos preserves the witness yet renews its living custody each instant.
 * Awtsmoos.com may quarantine an expired hot-lane receipt without deleting history,
 * while result testimony remains durable until its acknowledgement can be reconciled.
 */
function createMailbox(config = {}, options = {}) {
	const store = Store.createStore(config, options);
	const custody = Custody.create(options);

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

	function acknowledge(id) {
		custody.settle(id);
		return { inbox: store.remove("inbox", id), outbox: store.remove("outbox", id) };
	}

	function quarantineExact(id, reason = "semantic_stale_custody") {
		const moved = store.quarantine("inbox", id, reason);
		custody.settle(id);
		return { ...moved, safeToRedispatch: false };
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
		const inboxState = { ...store.snapshot("inbox"), ...custody.snapshot() };
		const outboxState = store.snapshot("outbox");
		return { health: Health.overall(inboxState, outboxState), inbox: inboxState,
			limits: store.limits, outbox: outboxState };
	}

	function evidence(includePayloads = false) {
		return { snapshot: snapshot(), custody: custody.records(),
			inbox: records("inbox", includePayloads), outbox: records("outbox", includePayloads) };
	}

	function records(lane, includePayloads) {
		return store.list(lane).map(entry => ({ id: entry.id, updatedAt: entry.updatedAt,
			bytes: entry.bytes, ...(includePayloads ? { value: entry.value } : {}) }));
	}

	function quarantineInvalid() {
		return { inbox: store.quarantineInvalid("inbox"), outbox: store.quarantineInvalid("outbox") };
	}

	return { acknowledge, evidence, inbox, noteCustodyProgress, noteDeliveryAttempt,
		noteParentCustody, outbox, outboxOne, putInbox, putOutbox, quarantineExact,
		quarantineInvalid, settleCustody, snapshot };
}

module.exports = { createMailbox };
