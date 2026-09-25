//B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const { createMessageRouter } = require("./controller-message-router.js");
const { createChildMessageRouter } = require("./child-message-router.js");
const Delivery = require("./child-delivery.js");
const Protocol = require("./protocol.js");

/**
 * @file Proves the READY/PARENT_READY handshake self-heals on STATE.
 * @description
 * The Awtsmoos does not leave a messenger voiceless for one lost breath.
 * Awtsmoos.com proves that the parent re-asserts PARENT_READY on every STATE
 * from the exact current child incarnation, so a lost READY *or* a lost
 * PARENT_READY both heal on the next STATE (the child publishes STATE every
 * 500ms). The child treats repeat PARENT_READY as a harmless no-op, queued
 * work redelivers exactly once, and stale incarnations are never notified.
 */

const CHILD = "child_current";
const STALE = "child_stale";

function makeController(notify, current) {
	return createMessageRouter({
		currentIncarnation: () => current,
		notify,
		mirror: () => {},
		publishStats: () => {},
		log: () => {},
		onRegistered: () => {}
	});
}

function stateFrame(incarnation) {
	return {
		...Protocol.message(Protocol.TYPES.STATE, { state: { registered: false } }),
		childIncarnationId: incarnation
	};
}

function readyFrame(incarnation) {
	return {
		...Protocol.message(Protocol.TYPES.READY, { pid: 4242 }),
		childIncarnationId: incarnation
	};
}

function parentReadyFrames(sent) {
	return sent.filter(m => m.type === Protocol.TYPES.PARENT_READY);
}

// --- 1. Lost READY heals on STATE ---
{
	const sent = [];
	const router = makeController(m => { sent.push(m); return true; }, CHILD);
	// READY never arrives (lost). First STATE from the current incarnation
	// must carry PARENT_READY.
	router.handle(stateFrame(CHILD));
	assert.equal(parentReadyFrames(sent).length, 1, "STATE must heal a lost READY with PARENT_READY");
	console.log("ok - lost READY heals on first current-incarnation STATE");
}

// --- 2. Lost PARENT_READY heals on the next STATE (retry until received) ---
{
	const sent = [];
	let fail = true;
	const router = makeController(m => { sent.push(m); return !fail; }, CHILD);
	router.handle(stateFrame(CHILD)); // first PARENT_READY attempt is lost (notify failed)
	fail = false;
	router.handle(stateFrame(CHILD)); // the next STATE must re-assert it
	assert.equal(parentReadyFrames(sent).length, 2, "a later STATE must re-assert PARENT_READY after a failed send");
	console.log("ok - lost PARENT_READY is re-asserted on the next STATE");
}

// --- 3. Stale incarnations are fenced out ---
{
	const sent = [];
	const router = makeController(m => { sent.push(m); return true; }, CHILD);
	router.handle(stateFrame(STALE));
	assert.equal(parentReadyFrames(sent).length, 0, "stale-incarnation STATE must never notify");
	router.handle(stateFrame(CHILD));
	assert.equal(parentReadyFrames(sent).length, 1, "current incarnation still heals after a stale STATE");
	console.log("ok - stale-incarnation STATE never notifies the current child");
}

// --- 4. Normal READY path still works ---
{
	const sent = [];
	const router = makeController(m => { sent.push(m); return true; }, CHILD);
	router.handle(readyFrame(CHILD));
	assert.equal(parentReadyFrames(sent).length, 1, "READY must still trigger PARENT_READY");
	console.log("ok - normal READY path still sends PARENT_READY");
}

// --- 5. End to end: a late PARENT_READY unblocks queued child delivery exactly once ---
function makeDelivery(inboxEntries) {
	const inbox = inboxEntries.map(entry => ({ ...entry }));
	const sentIpc = [];
	const state = {
		activeWs: { opened: true },
		childIncarnationId: CHILD,
		generation: 1,
		registrationConfirmed: true,
		tunnelName: "test-tunnel"
	};
	const mailbox = {
		inbox: () => inbox.map(entry => ({ ...entry })),
		outbox: () => [],
		putInbox: envelope => { inbox.push({ ...envelope }); },
		noteDeliveryAttempt: () => {}
	};
	const delivery = Delivery.createDelivery({
		Send: { safeSend: () => true },
		mailbox,
		send: message => { sentIpc.push(message); return true; },
		state,
		schedule: fn => fn()
	});
	return { delivery, sentIpc };
}

{
	const queued = {
		requestId: "ready-fallback-read",
		childIncarnationId: CHILD,
		sideEffectProof: "not_a_mutation_request",
		payload: { op: "read" }
	};
	const { delivery, sentIpc } = makeDelivery([queued]);

	// While the handshake is incomplete, queued work sits undelivered.
	assert.equal(sentIpc.length, 0, "queued work must wait while the handshake is incomplete");

	// Controller side: READY was lost; the STATE fallback produces PARENT_READY.
	const parentSent = [];
	const controller = makeController(m => { parentSent.push(m); return true; }, CHILD);
	controller.handle(stateFrame(CHILD));
	const fallback = parentReadyFrames(parentSent)[0];
	assert.ok(fallback, "fallback must produce a PARENT_READY frame");

	// Child side: the real child router accepts it and the real delivery
	// module resumes: the queued envelope is redelivered exactly once.
	const childRouter = createChildMessageRouter(delivery);
	assert.equal(childRouter.handle(fallback), true, "child router must accept the late PARENT_READY");
	assert.equal(sentIpc.length, 1, "queued work must redeliver once the late PARENT_READY arrives");
	assert.equal(sentIpc[0].type, Protocol.TYPES.REQUEST, "redelivered work travels as a REQUEST");
	assert.equal(sentIpc[0].envelope.requestId, "ready-fallback-read", "the queued envelope is the one redelivered");

	// A repeat PARENT_READY (next STATE) is a harmless no-op: no duplicate send.
	assert.equal(childRouter.handle(fallback), true, "repeat PARENT_READY must still be accepted");
	assert.equal(sentIpc.length, 1, "repeat PARENT_READY must not duplicate delivery");
	console.log("ok - late PARENT_READY unblocks queued delivery exactly once, repeats are harmless");
}

console.log("BHY the READY/PARENT_READY handshake self-heals on STATE");
