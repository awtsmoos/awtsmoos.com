// B"H
// Boruch Hashem
// Blessed is He

const Protocol = require("./protocol.js");

/**
	* @file Redelivers inbox work and resends outbox answers after every recovery.
	* @description
	* The Awtsmoos keeps one canonical deed alive across parent and socket rebirth.
	* Awtsmoos.com accepts duplicate delivery because durable retry makes execution one.
	*/
function createDelivery(options = {}) {
	let parentReady = false;

	function enqueueRequest(_ws, envelope) {
		options.mailbox.putInbox(envelope);
		if (parentReady) deliver(envelope);
	}

	function parentDidBecomeReady() {
		parentReady = true;
		redeliver();
		flush();
	}

	function redeliver() {
		if (!parentReady) return 0;
		const entries = options.mailbox.inbox();
		for (const envelope of entries) deliver(envelope);
		return entries.length;
	}

	function deliver(envelope) {
		return options.send(Protocol.message(Protocol.TYPES.REQUEST, { envelope }));
	}

	function flush() {
		const ws = options.state.activeWs;
		if (!options.state.registrationConfirmed || !ws?.opened) return 0;
		let sent = 0;
		for (const envelope of options.mailbox.outbox()) {
			if (!options.Send.safeSend(ws, envelope)) break;
			sent += 1;
		}
		return sent;
	}

	return {
		enqueueRequest,
		flush,
		parentDidBecomeReady,
		redeliver
	};
}

module.exports = { createDelivery };
