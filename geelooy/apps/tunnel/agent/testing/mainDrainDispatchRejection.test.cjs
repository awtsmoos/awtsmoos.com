// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const Drain = require("../lib/runtime/main-drain.js");

/**
 * @file Proves a dispatch whose socket died reaches the caller as an explicit rejection.
 * @description
 * The Awtsmoos never lets a deed vanish without testimony; Awtsmoos.com rejects the
 * dispatch by name when the vessel cannot carry it, so no caller waits in silence.
 */

function makeItem(ws) {
	return {
		ws,
		data: { id: "dispatch-rejection-proof" },
		lane: "p4_bulk",
		enqueuedAt: Date.now(),
		requesterKey: "requester-proof",
		requestKey: "request-proof",
		childIncarnationId: ""
	};
}

function makeLog() {
	return { rejectDrop: [], release: [], runRequest: [], messages: [] };
}

function makeDependencies(log) {
	return {
		clearQueueKeepalive() {},
		rejectDrop(item, reason) { log.rejectDrop.push({ item, reason }); },
		release(lane, requesterKey, requestKey) { log.release.push({ lane, requesterKey, requestKey }); },
		runRequest() { log.runRequest.push(1); return Promise.resolve({ ok: true }); },
		log(level, message) { log.messages.push({ level, message }); }
	};
}

async function captureRejection(promise) {
	try {
		await promise;
	} catch (error) {
		return error;
	}
	return null;
}

test("dispatchItem with an unusable socket rejects explicitly instead of dropping silently", async () => {
	const log = makeLog();
	const error = await captureRejection(
		Drain.dispatchItem(makeDependencies(log), makeItem({ opened: false }))
	);
	assert.ok(error instanceof Error, "caller must receive an explicit rejection, not silence");
	assert.equal(error.code, "dispatch_socket_unusable");
	assert.match(error.message, /dispatch_socket_unusable/);
	assert.equal(log.rejectDrop.length, 1);
	assert.equal(log.rejectDrop[0].reason, "dispatch_socket_unusable");
	assert.equal(log.release.length, 1);
	assert.equal(log.release[0].lane, "p4_bulk");
	assert.equal(log.runRequest.length, 0);
	assert.ok(log.messages.some(entry => entry.level === "warn"), "refusal is logged by name");
});

test("dispatchItem with a usable socket hands the item to the runner without rejecting", async () => {
	const log = makeLog();
	await Drain.dispatchItem(makeDependencies(log), makeItem({ opened: true }));
	assert.equal(log.runRequest.length, 1);
	assert.equal(log.rejectDrop.length, 0);
});

test("drainQueue keeps admitting the burst after one unusable socket rejects", async () => {
	const log = makeLog();
	const items = [makeItem({ opened: false }), makeItem({ opened: true }), makeItem({ opened: true })];
	const runtime = Drain.createDrainRuntime({
		...makeDependencies(log),
		state: () => ({}),
		scheduleImmediate: fn => fn(),
		takeNext: () => items.shift() || null
	});
	assert.equal(runtime.drainQueue(), 3);
	await new Promise(resolve => setImmediate(resolve));
	assert.equal(log.runRequest.length, 2);
	assert.equal(log.rejectDrop.length, 1);
	assert.equal(log.release.length, 1);
});
