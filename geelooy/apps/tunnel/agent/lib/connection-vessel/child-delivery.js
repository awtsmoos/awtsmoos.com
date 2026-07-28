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
	let inboxReplayScheduled = false;
	let outboxReplayScheduled = false;
	const replayBatchSize = bounded(options.replayBatchSize, 8);
	const schedule = options.schedule || setImmediate;

	function enqueueRequest(ws, envelope) {
		options.mailbox.putInbox(envelope);
		transmit({
			type: "TUNNEL_REQUEST_ACK",
			id: Protocol.requestId(envelope),
			transportReceiptId: Protocol.requestId(envelope),
			acceptedAt: new Date().toISOString(),
			durable: true
		}, ws);
		if (parentReady) deliver(envelope);
	}

	function parentDidBecomeReady() {
		parentReady = true;
		redeliver();
		flush();
	}

	function redeliver() {
		if (!parentReady || inboxReplayScheduled) return 0;
		const entries = options.mailbox.inbox();
		inboxReplayScheduled = true;
		drain(entries, deliver, () => {
			inboxReplayScheduled = false;
		});
		return entries.length;
	}

	function deliver(envelope) {
		return options.send(Protocol.message(Protocol.TYPES.REQUEST, { envelope }));
	}

	function flush(id = "") {
		const ws = options.state.activeWs;
		if (!options.state.registrationConfirmed || !ws?.opened) return 0;
		if (id && typeof options.mailbox.outboxOne === "function") {
			const envelope = options.mailbox.outboxOne(id);
			return envelope && options.Send.safeSend(ws, envelope) ? 1 : 0;
		}
		if (outboxReplayScheduled) return 0;
		const entries = options.mailbox.outbox();
		outboxReplayScheduled = true;
		drain(entries, envelope => options.Send.safeSend(ws, envelope), () => {
			outboxReplayScheduled = false;
		});
		return entries.length;
	}

	function transmit(envelope, socket = options.state.activeWs) {
		if (!options.state.registrationConfirmed || !socket?.opened) return false;
		return options.Send.safeSend(socket, envelope);
	}

	function drain(entries, effect, complete) {
		let index = 0;
		function next() {
			const end = Math.min(entries.length, index + replayBatchSize);
			while (index < end) {
				if (effect(entries[index]) === false) {
					complete();
					return;
				}
				index += 1;
			}
			if (index < entries.length) {
				schedule(next);
				return;
			}
			complete();
		}
		next();
	}

	return {
		enqueueRequest,
		flush,
		parentDidBecomeReady,
		redeliver,
		transmit
	};
}

function bounded(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number)
		? Math.max(1, Math.min(64, Math.floor(number)))
		: fallback;
}

module.exports = { createDelivery };
