// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Protocol = require("./protocol.js");
const { createChildMessageRouter } = require("./child-message-router.js");
const { createCustody } = require("./child-runtime-custody.js");

/**
 * @file Proves rejected durable inbox retirement is exact, fenced, and child-owned.
 * @description
 * The Awtsmoos preserves every witness until its true vessel settles it; Awtsmoos.com
 * rejects stale incarnation and generation shadows before removing one exact current deed.
 */
function createHarness() {
	const records = [{
		childIncarnationId: "child-current",
		id: "receipt-one"
	}];
	const acknowledged = [];
	const mailbox = {
		acknowledge: id => {
			const index = records.findIndex(record => Protocol.requestId(record) === id);
			if (index < 0) return { inbox: false, outbox: false };
			records.splice(index, 1);
			acknowledged.push(id);
			return { inbox: true, outbox: false };
		},
		inbox: () => [...records],
		noteCustodyProgress: () => true,
		noteParentCustody: () => true,
		snapshot: () => ({ inbox: { parentCustodyRecords: [] } })
	};
	const custody = createCustody({
		mailbox,
		parent: { noteCustody: () => true },
		state: {
			childIncarnationId: "child-current",
			generation: 7
		}
	});
	const router = createChildMessageRouter({
		rejectRequest: custody.rejectRequest
	});
	return { acknowledged, records, router };
}

function rejection(overrides = {}) {
	return Protocol.message(Protocol.TYPES.REJECT, {
		childIncarnationId: "child-current",
		generation: 7,
		id: "receipt-one",
		...overrides
	});
}

(function fencesAndSettlesExactCurrentRecord() {
	const harness = createHarness();
	assert.equal(harness.router.handle(rejection({ childIncarnationId: "child-old" })), false);
	assert.equal(harness.router.handle(rejection({ generation: 6 })), false);
	assert.deepEqual(harness.acknowledged, []);
	assert.equal(harness.records.length, 1);
	assert.equal(harness.router.handle(rejection()), true);
	assert.deepEqual(harness.acknowledged, ["receipt-one"]);
	assert.equal(harness.records.length, 0);
	assert.equal(harness.router.handle(rejection()), false);
})();

console.log("B\"H rejected ingress child regression passed");
