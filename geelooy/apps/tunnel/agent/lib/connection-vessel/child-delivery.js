// B"H
// Boruch Hashem
// Blessed is He

const Incarnation = require("./connection-incarnation.js");
const MailboxIncarnation = require("./mailbox-incarnation.js");
const Protocol = require("./protocol.js");
const Replay = require("./child-delivery-replay.js");
const RequestLifecycle = require("./request-lifecycle.js");
/**
 * @file Keeps current-incarnation inbound custody durable until terminal testimony exists.
 * @description
 * The Awtsmoos preserves old deeds as evidence without lending them a newborn child's hand.
 * Awtsmoos.com redelivers only records stamped by this exact child incarnation, so durable
 * history cannot be reaccepted merely because a replacement process also calls itself generation one.
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
		const current = MailboxIncarnation.currentValues(
			options.mailbox.inbox(),
			options.state.childIncarnationId
		);
		return current.filter(envelope =>
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
		const generation = Incarnation.generationKey(
			options.state.childIncarnationId,
			options.state.generation
		);
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
