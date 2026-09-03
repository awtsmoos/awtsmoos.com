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
 * @file Proves controller routing preserves generation custody and terminal authority.
 * @description
 * The Awtsmoos renews each child in its exact generation, never lending yesterday today's crown;
 * Awtsmoos.com forwards the living request, then lets displaced authority lay its process down.
 */
const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), "awts-controller-"));
const children = [];
const exits = [];
const requests = [];
const state = { generation: 7 };

/**
 * Creates one deterministic child-process witness for controller integration.
 * @returns {EventEmitter} Fake child with send and kill behavior.
 * @sideEffects Appends the child to the test-owned collection.
 */
function fakeChild() {
	const child = new EventEmitter();
	child.connected = true;
	child.pid = 9000 + children.length;
	child.messages = [];
	child.send = (message) => {
		child.messages.push(message);
		return true;
	};
	child.kill = () => {
		child.emit("exit", 0, "SIGTERM");
	};
	children.push(child);
	return child;
}

const controller = Controller.createController({
	enqueueRequest: (_proxy, envelope) => {
		requests.push(envelope);
	},
	exitProcess: (code) => {
		exits.push(code);
	},
	forkChild: fakeChild,
	loadConfig: () => ({
		deviceStateRoot: path.join(sandbox, "state"),
		root: sandbox,
		tunnelName: "awt-controller-test"
	}),
	stats: (options) => ({
		workers: {
			current: { active: 1 },
			...(options.workers === false ? {} : {
				active: {
					worker_one: { jobId: "job_one" }
				}
			})
		}
	}),
	state
});

controller.connect();
const child = children[0];
child.emit("message", Protocol.message(Protocol.TYPES.READY));
assert.equal(child.messages[0].type, Protocol.TYPES.PARENT_READY);
assert.equal(child.messages[1].type, Protocol.TYPES.STATS);
assert.equal(child.messages[1].stats.workers.current.active, 1);
assert.equal(child.messages[1].stats.workers.active, undefined);

child.emit("message", Protocol.message(Protocol.TYPES.REQUEST, {
	childIncarnationId: controller.status().childIncarnationId,
	envelope: { id: "request-one" }
}));
assert.equal(requests[0].id, "request-one");
assert.equal(requests[0].connectionCustody.generation, 7);
assert.equal(requests[0].connectionCustody.childIncarnationId, controller.status().childIncarnationId);

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
		generationCustodyForwarded: true,
		statsForwarded: true,
		terminalOwnerExit: true,
		noTerminalRestart: true
	}, null, 2));
});
