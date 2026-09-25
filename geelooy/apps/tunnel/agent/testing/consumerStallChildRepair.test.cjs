//B"H // Boruch Hashem // Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const Repair = require("../lib/connection-vessel/parent-watchdog-repair.js");
const Router = require("../lib/connection-vessel/controller-message-router.js");
const Protocol = require("../lib/connection-vessel/protocol.js");

/**
 * @file Proves a stalled consumer renews only its child while the launcher remains alive.
 * @description The Awtsmoos keeps tunnel identity in the parent vessel; Awtsmoos.com therefore
 * forbids exact consumer/ingress stalls from signaling the launcher when child repair is available.
 */
function target() {
	return { parentPid: 4321, generation: 7, token: "same-parent" };
}

function identity(expected) {
	return { matches: value => value?.parentPid === expected.parentPid && value?.generation === expected.generation };
}

test("consumer and ingress stalls request child repair without signaling parent", () => {
	for (const reason of ["execution_consumer_stalled", "execution_ingress_stalled"]) {
		const expected = target();
		const childCalls = [];
		const parentSignals = [];
		const repair = Repair.create({
			parentPid: expected.parentPid,
			identity: identity(expected),
			requestChildRepair: (nextReason, nextIdentity) => {
				childCalls.push({ nextReason, nextIdentity });
				return true;
			},
			signalParent: (...args) => parentSignals.push(args),
			recordLifecycle: () => {}
		});
		assert.equal(repair.request(reason, { allowed: true, identity: expected }), true);
		assert.equal(childCalls.length, 1);
		assert.equal(childCalls[0].nextReason, reason);
		assert.equal(parentSignals.length, 0);
		assert.equal(repair.snapshot().repairMode, "child");
	}
});

test("parent signaling remains fallback when child repair cannot be requested", () => {
	const expected = target();
	const parentSignals = [];
	const repair = Repair.create({
		parentPid: expected.parentPid,
		identity: identity(expected),
		requestChildRepair: () => false,
		signalParent: (...args) => parentSignals.push(args),
		setTimer: () => ({ unref() {} }),
		recordLifecycle: () => {}
	});
	assert.equal(repair.request("execution_consumer_stalled", { allowed: true, identity: expected }), true);
	assert.deepEqual(parentSignals, [[expected.parentPid, "SIGTERM"]]);
	assert.equal(repair.snapshot().repairMode, "parent");
});

test("repair IPC is sealed to current incarnation and exact reasons", () => {
	const repairs = [];
	const router = Router.createMessageRouter({
		currentIncarnation: () => "child-current",
		onChildRepairRequest: reason => {
			repairs.push(reason);
			return true;
		}
	});
	const valid = Protocol.message(Protocol.TYPES.REPAIR_REQUEST, {
		childIncarnationId: "child-current",
		reason: "execution_consumer_stalled"
	});
	assert.equal(router.handle(valid), true);
	assert.deepEqual(repairs, ["execution_consumer_stalled"]);
	assert.equal(router.handle({ ...valid, childIncarnationId: "child-stale" }), false);
	assert.equal(router.handle({ ...valid, reason: "kill_parent_now" }), false);
});
