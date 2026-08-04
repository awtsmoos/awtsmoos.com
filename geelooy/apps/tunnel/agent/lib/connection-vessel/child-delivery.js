// B"H
// Boruch Hashem
// Blessed is He

const Protocol = require("./protocol.js");
const RequestLifecycle = require("./request-lifecycle.js");

/**
 * @file Redelivers durable work and reconstructs acceptance once per socket generation.
 * @description
 * The Awtsmoos lets inbox custody outlive the connection child. On each registered
 * generation Awtsmoos.com rebuilds missing acceptance and progress from disk exactly
 * once, then resumes bounded inbox and outbox delivery without duplicating execution.
 */
function createDelivery(options = {}) {
	let parentReady = false;
	let inboxReplayScheduled = false;
	let outboxReplayScheduled = false;
	let recoveredGeneration = null;
	const replayBatchSize = bounded(options.replayBatchSize, 8);
	const schedule = options.schedule || setImmediate;
	const lifecycle = RequestLifecycle.createRequestLifecycle({
		state: options.state,
		transmit
	});

	function enqueueRequest(ws, envelope) {
		options.mailbox.putInbox(envelope);
		lifecycle.accept(envelope, ws);
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
		drain(entries, deliver, () => inboxReplayScheduled = false);
		return entries.length;
	}

	function deliver(envelope) {
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
		drain(entries, envelope => options.Send.safeSend(ws, envelope),
			() => outboxReplayScheduled = false);
		return entries.length;
	}

	function recoverGeneration(ws) {
		const generation = Number(options.state.generation || 0);
		if (generation === recoveredGeneration) return 0;
		recoveredGeneration = generation;
		return lifecycle.recover(options.mailbox.inbox(), ws);
	}

	function transmit(envelope, socket = options.state.activeWs) {
		if (!options.state.registrationConfirmed || !socket?.opened) return false;
		return options.Send.safeSend(socket, envelope);
	}

	function drain(entries, effect, complete) {
		let index = 0;
		function next() {
			const end = Math.min(entries.length, index + replayBatchSize);
			while (index < end && effect(entries[index]) !== false) index += 1;
			if (index < entries.length) return schedule(next);
			complete();
		}
		next();
	}

	return {
		enqueueRequest,
		flush,
		parentDidBecomeReady,
		pendingAcceptances: lifecycle.pendingAcceptances,
		pendingProgress: lifecycle.pendingProgress,
		recoverGeneration,
		redeliver,
		transmit
	};
}

function bounded(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) ? Math.max(1, Math.min(64, Math.floor(number))) : fallback;
}

module.exports = { createDelivery };
