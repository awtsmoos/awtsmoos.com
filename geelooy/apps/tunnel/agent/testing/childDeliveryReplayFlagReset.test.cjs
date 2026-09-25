// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Delivery = require("../lib/connection-vessel/child-delivery.js");

const CHILD_INCARNATION_ID = "child-delivery-replay-guard";

/**
 * @file Proves a throwing sender can never wedge inbox/outbox replay flags.
 * @description
 * The Awtsmoos replays durable deeds through measured turns. Awtsmoos.com keeps
 * redelivery alive after a failed attempt: a sender that throws must surface as
 * the replay drain's early-completion signal, never as an escaping exception,
 * or the replay-scheduled flag would stay true forever and silence every future
 * redelivery for the life of the child.
 */
function makeDelivery({ throwOnIpcSend, throwOnSafeSend, inboxEntries }) {
	const inbox = (inboxEntries === undefined ? [
		{ requestId: "replay-one", childIncarnationId: CHILD_INCARNATION_ID },
		{ requestId: "replay-two", childIncarnationId: CHILD_INCARNATION_ID }
	] : inboxEntries).map(envelope => ({
		...envelope,
		childIncarnationId: CHILD_INCARNATION_ID
	}));
	const outbox = [{ id: "answer-one" }];
	const sentIpc = [];
	const state = {
		activeWs: { opened: true },
		childIncarnationId: CHILD_INCARNATION_ID,
		generation: 1,
		registrationConfirmed: true
	};
	const mailbox = {
		inbox: () => [...inbox],
		outbox: () => [...outbox],
		outboxOne: id => outbox.find(entry => entry.id === id) || null,
		putInbox: envelope => inbox.push({
			...envelope,
			childIncarnationId: CHILD_INCARNATION_ID
		})
	};
	const runtime = Delivery.createDelivery({
		Send: {
			safeSend: (ws, envelope) => {
				if (throwOnSafeSend()) throw new Error("socket send boom");
				return true;
			}
		},
		mailbox,
		send: message => {
			if (throwOnIpcSend()) throw new Error("ipc send boom");
			sentIpc.push(message);
			return true;
		},
		state
	});
	return { runtime, sentIpc };
}

function run() {
	// Inbox path: the first redelivery attempt throws on the first envelope.
	let ipcShouldThrow = true;
	const first = makeDelivery({
		throwOnIpcSend: () => ipcShouldThrow,
		throwOnSafeSend: () => false
	});
	first.runtime.parentDidBecomeReady();
	assert.equal(first.sentIpc.length, 0, "throwing send delivers nothing");

	// The replay flag must have reset: a second redeliver retries the same set.
	ipcShouldThrow = false;
	const redelivered = first.runtime.redeliver();
	assert.equal(redelivered, 2, "replay must remain scheduled after a throw");
	assert.equal(first.sentIpc.length, 2, "both envelopes redelivered on retry");
	assert.equal(first.sentIpc[0].envelope.requestId, "replay-one");
	assert.equal(first.sentIpc[1].envelope.requestId, "replay-two");

	// Outbox path: a throwing safeSend must not wedge the outbox replay flag.
	// (Empty inbox keeps the acceptance path out of this scenario.)
	let safeSendShouldThrow = true;
	const second = makeDelivery({
		throwOnIpcSend: () => false,
		throwOnSafeSend: () => safeSendShouldThrow,
		inboxEntries: []
	});
	assert.equal(second.runtime.flush(), 1, "first flush should report the outbox entry");
	safeSendShouldThrow = false;
	assert.equal(second.runtime.flush(), 1, "outbox replay must retry after a throw");

	// transmit() path: a throwing safeSend must report "not sent", never throw
	// out of generation recovery.
	let transmitShouldThrow = true;
	const third = makeDelivery({
		throwOnIpcSend: () => false,
		throwOnSafeSend: () => transmitShouldThrow
	});
	assert.equal(
		third.runtime.transmit({ requestId: "tx-one" }),
		false,
		"transmit must not throw when the sender throws"
	);
	transmitShouldThrow = false;
	assert.equal(
		third.runtime.transmit({ requestId: "tx-one" }),
		true,
		"transmit delivers once the sender recovers"
	);

	console.log(JSON.stringify({
		ok: true,
		suite: "child-delivery-replay-flag-reset",
		inboxReplaySurvivesThrow: true,
		outboxReplaySurvivesThrow: true,
		transmitSurvivesThrow: true
	}, null, 2));
}

run();
