// B"H
// Boruch Hashem
// Blessed is He

const Protocol = require("./protocol.js");
const Replay = require("./child-delivery-replay.js");
const RequestLifecycle = require("./request-lifecycle.js");

/**
 * @file Keeps inbound custody durable until terminal outbound testimony exists.
 * @description
 * The Awtsmoos passes one deed from inbox to execution to outbox without a void.
 * Awtsmoos.com marks every parent handoff attempt before IPC, so silence gains a bounded witness.
 */
function createDelivery(options = {}) {
	let parentReady = false;
	let inboxReplayScheduled = false;
	let outboxReplayScheduled = false;
	let recoveredGeneration = null;
	const replay = Replay.create({
		batchSize: options.replayBatchSize,
		schedule: options.schedule
	});
	const lifecycle = RequestLifecycle.createRequestLifecycle({
		state: options.state,
		transmit
	});

	function enqueueRequest(ws, envelope) {
		options.mailbox.putInbox(envelope);
		lifecycle.accept(envelope, ws);
		const receiptId = Protocol.requestId(envelope);
		if (hasTerminal(receiptId)) return flush(receiptId);
		if (parentReady) deliver(envelope);
	}

	function parentDidBecomeReady() {
		parentReady = true;
		redeliver();
		flush();
	}

	function redeliver() {
		if (!parentReady || inboxReplayScheduled) return 0;
		const entries = unsettledInbox();
		inboxReplayScheduled = true;
		replay.drain(entries, deliver, () => inboxReplayScheduled = false);
		return entries.length;
	}

	function unsettledInbox() {
		return options.mailbox.inbox().filter(envelope =>
			!hasTerminal(Protocol.requestId(envelope))
		);
	}

	function hasTerminal(receiptId) {
		return Boolean(
			receiptId &&
			typeof options.mailbox.outboxOne === "function" &&
			options.mailbox.outboxOne(receiptId)
		);
	}

	function deliver(envelope) {
		const receiptId = Protocol.requestId(envelope);
		options.mailbox.noteDeliveryAttempt?.(receiptId);
		return options.send(Protocol.message(Protocol.TYPES.REQUEST, { envelope }));
	}

	function flush(id = "") {
		const ws = options.state.activeWs;
		if (!options.state.registrationConfirmed || !ws?.opened) return 0;
		recoverGeneration(ws);
		lifecycle.flush(ws);
		if (id && typeof options.mailbox.outboxOne === "function") {
			const envelope = options.mailbox.outboxOne(id);
			return envelope && options.Send.safeSend(ws, envelope) ? 1 : 0;
		}
		if (outboxReplayScheduled) return 0;
		const entries = options.mailbox.outbox();
		outboxReplayScheduled = true;
		replay.drain(
			entries,
			envelope => options.Send.safeSend(ws, envelope),
			() => outboxReplayScheduled = false
		);
		return entries.length;
	}

	function recoverGeneration(ws) {
		const generation = Number(options.state.generation || 0);
		if (generation === recoveredGeneration) return 0;
		recoveredGeneration = generation;
		return lifecycle.recover(unsettledInbox(), ws);
	}

	function transmit(envelope, socket = options.state.activeWs) {
		if (!options.state.registrationConfirmed || !socket?.opened) return false;
		return options.Send.safeSend(socket, envelope);
	}

	return {
		enqueueRequest,
		flush,
		parentDidBecomeReady,
		pendingAcceptances: lifecycle.pendingAcceptances,
		pendingProgress: lifecycle.pendingProgress,
		recoverGeneration,
		redeliver,
		transmit,
		unsettledInbox
	};
}

module.exports = { createDelivery };
