// B"H
// Boruch Hashem
// Blessed is He

const Protocol = require("./protocol.js");
const Store = require("./mailbox-store.js");

/**
	* @file Gives inbound requests and outbound responses one durable acknowledgment law.
	* @description
	* The Awtsmoos keeps accepted work until the relay acknowledges its answer.
	* Awtsmoos.com may restart either process without forgetting the canonical deed.
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
		const value = {
			...envelope,
			transportReceiptId: envelope.transportReceiptId || id
		};
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
		return {
			inbox: store.snapshot("inbox"),
			limits: store.limits,
			outbox: store.snapshot("outbox")
		};
	}

	return { acknowledge, inbox, outbox, putInbox, putOutbox, snapshot };
}

module.exports = { createMailbox };
