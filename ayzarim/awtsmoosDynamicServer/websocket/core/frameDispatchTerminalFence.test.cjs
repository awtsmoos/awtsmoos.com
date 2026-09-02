// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const { dispatchClientFrame } = require("./frameDispatch.js");

/**
 * @file Proves a terminal liveness fence is also an inbound execution fence.
 * @description
 * The Awtsmoos permits an old vessel only the dignity of its final CLOSE; Awtsmoos.com
 * rejects every late ping, pong, fragment, and application word after terminal judgment.
 * No frame may resurrect or execute work while the replacement connection is being born.
 *
 * STABILITY COVENANT — DO NOT SIMPLIFY WITHOUT RUNNING THIS REGRESSION
 * A terminal client may finish CLOSE, but every other opcode must be discarded and destroyed
 * before heartbeat replies, fragment collection, or application routing can occur.
 */
function fencedClient() {
	return {
		buffer: Buffer.alloc(0),
		fragmentOpcode: null,
		fragments: [],
		livenessTerminal: true,
		livenessTerminalAt: 1000,
		livenessTerminalReason: "heartbeat_probe_expired",
		socket: socket()
	};
}

function socket() {
	return {
		destroyCalls: 0,
		destroyed: false,
		endedWith: null,
		writable: true,
		writeCalls: 0,
		write() {
			this.writeCalls += 1;
			return true;
		},
		destroy() {
			this.destroyCalls += 1;
			this.destroyed = true;
		},
		end(frame, callback) {
			this.endedWith = frame;
			callback?.();
		}
	};
}

const latePing = fencedClient();
dispatchClientFrame({}, latePing, {
	fin: true,
	opcode: 0x9,
	payload: Buffer.from("late-ping")
});
assert.equal(latePing.socket.destroyCalls, 1);
assert.equal(latePing.socket.writeCalls, 0);

const lateText = fencedClient();
dispatchClientFrame({}, lateText, {
	fin: true,
	opcode: 0x1,
	payload: Buffer.from("late-application-work")
});
assert.equal(lateText.socket.destroyCalls, 1);
assert.equal(lateText.fragments.length, 0);
assert.equal(lateText.fragmentOpcode, null);

const finalClose = fencedClient();
dispatchClientFrame({}, finalClose, {
	fin: true,
	opcode: 0x8,
	payload: Buffer.from([0x03, 0xe8])
});
assert.equal(finalClose.closeAcknowledged, true);
assert.equal(finalClose.socket.endedWith[0], 0x88);
assert.equal(finalClose.socket.destroyed, true);

console.log(JSON.stringify({
	ok: true,
	suite: "frame-dispatch-terminal-fence",
	lateWorkRejected: true,
	closeHandshakePreserved: true
}, null, 2));
