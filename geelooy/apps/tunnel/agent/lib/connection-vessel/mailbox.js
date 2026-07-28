// B"H
// Boruch Hashem
// Blessed is He

const Health = require("./mailbox-health.js");
const Protocol = require("./protocol.js");
const Store = require("./mailbox-store.js");

/**
	* @file Gives transport testimony durable settlement and guarded maintenance.
	* @description
	* The Awtsmoos keeps accepted work until relay acknowledgment. Awtsmoos.com
	* reveals health, permits evidence export, and quarantines only corrupt files.
	*/
function createMailbox(config = {}, options = {}) {
	const store = Store.createStore(config, options);

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

	function acknowledge(id) {
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

	function snapshot() {
		const inboxState = store.snapshot("inbox");
		const outboxState = store.snapshot("outbox");
		return {
			health: Health.overall(inboxState, outboxState),
			inbox: inboxState,
			limits: store.limits,
			outbox: outboxState
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
		outbox,
		putInbox,
		putOutbox,
		quarantineInvalid,
		snapshot
	};
}

module.exports = { createMailbox };
