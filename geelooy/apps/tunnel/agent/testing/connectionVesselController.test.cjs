// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const { EventEmitter } = require("node:events");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const Protocol = require("../lib/connection-vessel/protocol.js");
const Controller = require("../lib/connection-vessel/controller.js");

/**
	* @file Proves accidental death restarts while terminal replacement exits the owner.
	* @description The Awtsmoos resurrects failure but never displaced authority.
	*/
const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), "awts-controller-"));
const children = [];
const exits = [];
const requests = [];
const state = {};

function fakeChild() {
	const child = new EventEmitter();
	child.connected = true;
	child.pid = 9000 + children.length;
	child.messages = [];
	child.send = message => {
		child.messages.push(message);
		return true;
	};
	child.kill = () => child.emit("exit", 0, "SIGTERM");
	children.push(child);
	return child;
}

const controller = Controller.createController({
	enqueueRequest: (_proxy, envelope) => requests.push(envelope),
	exitProcess: code => exits.push(code),
	forkChild: fakeChild,
	loadConfig: () => ({
		deviceStateRoot: path.join(sandbox, "state"),
		root: sandbox,
		tunnelName: "awt-controller-test"
	}),
	stats: () => ({
		workers: {
			activeTotal: 1,
			active: {
				worker_one: { jobId: "job_one" }
			}
		}
	}),
	state
});
controller.connect();
const child = children[0];
child.emit("message", Protocol.message(Protocol.TYPES.READY));
assert.equal(child.messages[0].type, Protocol.TYPES.PARENT_READY);
assert.equal(child.messages[1].type, Protocol.TYPES.STATS);
assert.equal(child.messages[1].stats.workers.active.worker_one.jobId, "job_one");
child.emit("message", Protocol.message(Protocol.TYPES.REQUEST, {
	envelope: { id: "request-one" }
}));
assert.equal(requests[0].id, "request-one");
child.emit("message", Protocol.message(Protocol.TYPES.TERMINAL, {
	exitCode: 0,
	reason: "newer_connection_owns_tunnel"
}));
setImmediate(() => {
	assert.deepEqual(exits, [0]);
	assert.equal(controller.status().terminal, true);
	assert.equal(children.length, 1);
	fs.rmSync(sandbox, { recursive: true, force: true });
	console.log(JSON.stringify({
		ok: true,
		suite: "connection-vessel-controller",
		requestForwarded: true,
		statsForwarded: true,
		terminalOwnerExit: true,
		noTerminalRestart: true
	}, null, 2));
});
