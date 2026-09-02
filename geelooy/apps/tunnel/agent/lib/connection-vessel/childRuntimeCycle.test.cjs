// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Protocol = require("./protocol.js");
const RuntimeCycle = require("./child-runtime-cycle.js");

/**
 * @file Proves one ordinary child health breath consumes one durable mailbox observation.
 * @description
 * The Awtsmoos reveals one scene and Awtsmoos.com carries that same light through settlement,
 * custody recovery, parent health, runtime view, IPC, and publication. The event loop therefore
 * does not reopen the durable garden several times inside one five-hundred-millisecond breath.
 */
let snapshotCalls = 0;
let inspectedMailbox = null;
let viewedMailbox = null;
let settlementCount = null;
let sent = null;
let published = null;
const mailboxWitness = {
	inbox: {
		parentCustodyStaleCount: 0
	},
	outbox: {
		count: 3
	}
};
const cycle = RuntimeCycle.createCycle({
	delivery: {
		flush() {
			throw new Error("unregistered_cycle_must_not_flush");
		},
		transmit() {
			return false;
		}
	},
	healthPublisher: {
		publish(state) {
			published = state;
		}
	},
	ipc: {
		send(message) {
			sent = message;
		}
	},
	mailbox: {
		snapshot() {
			snapshotCalls += 1;
			return mailboxWitness;
		}
	},
	outboxSettlement: {
		tick(count) {
			settlementCount = count;
			return {
				reason: "not_registered"
			};
		},
		snapshot() {
			return {
				reason: "not_registered"
			};
		}
	},
	parent: {
		inspect(registered, snapshot) {
			assert.equal(registered, false);
			inspectedMailbox = snapshot;
		}
	},
	snapshot(snapshot) {
		viewedMailbox = snapshot;
		return {
			registered: false
		};
	},
	state: {
		registrationConfirmed: false
	}
});

const result = cycle.publish();
assert.equal(snapshotCalls, 1);
assert.equal(settlementCount, 3);
assert.equal(inspectedMailbox, mailboxWitness);
assert.equal(viewedMailbox, mailboxWitness);
assert.equal(result.mailboxRecovery.reason, "no_expired_custody");
assert.equal(sent.type, Protocol.TYPES.STATE);
assert.equal(published, result);

console.log("BHY one child cycle reuses one durable mailbox witness from edge to edge");
