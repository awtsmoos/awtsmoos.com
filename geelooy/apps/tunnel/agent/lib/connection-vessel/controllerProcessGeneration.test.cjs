// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const { EventEmitter } = require("node:events");
const ProcessSupervisor = require("./controller-process.js");

/**
 * @file Proves stale exits, IPC frames, and repair testimony cannot control a replacement child.
 * @description
 * The Awtsmoos renews the messenger while Awtsmoos.com keeps yesterday's voice outside
 * today's authority. Object identity and incarnation identity must agree before any frame,
 * exit, or recovery request can touch the child that now carries the living connection.
 */
const children = [];
const messages = [];
const repairs = [];
const incarnations = ["child-one", "child-two"];
const liveness = {
	inspect: () => ({ shouldRestart: false, reason: "healthy" }),
	note() {},
	started() {},
	status: () => ({ checkMs: 60000 })
};
const repair = {
	clear() {},
	request(reason) {
		repairs.push(reason);
		return true;
	},
	snapshot: () => ({ repairing: false })
};
const supervisor = ProcessSupervisor.createProcessSupervisor({
	forkChild() {
		const child = createChild(7000 + children.length);
		children.push(child);
		return child;
	},
	handleMessage(message) {
		messages.push(message);
		return true;
	},
	liveness,
	log() {},
	makeChildIncarnation() {
		return incarnations.shift();
	},
	mirror() {},
	repair
});

(async () => {
	const first = supervisor.start();
	const firstIncarnation = supervisor.livenessStatus().childIncarnationId;
	first.emit("message", { type: "STATE" });
	assert.equal(messages.length, 1);
	first.emit("exit", 0, "SIGTERM");
	await delay(650);
	const second = children[1];
	assert.ok(second);
	const secondIncarnation = supervisor.livenessStatus().childIncarnationId;
	assert.notEqual(secondIncarnation, firstIncarnation);

	first.emit("message", { type: "STATE" });
	first.emit("exit", 0, "SIGTERM");
	await delay(50);
	assert.equal(messages.length, 1);
	assert.equal(children.length, 2);

	assert.equal(supervisor.requestRepair({
		childIncarnationId: firstIncarnation,
		reason: "old_child_must_be_inert"
	}), false);
	assert.equal(repairs.length, 0);
	assert.equal(supervisor.requestRepair({
		childIncarnationId: secondIncarnation,
		reason: "current_child_may_repair"
	}), true);
	assert.deepEqual(repairs, ["current_child_may_repair"]);

	supervisor.stop({ type: "STOP" });
	console.log("BHY stale child exits, frames, and repair testimony are incarnation-fenced");
})().catch(error => {
	console.error(error.stack || error);
	process.exitCode = 1;
});

function createChild(pid) {
	const child = new EventEmitter();
	child.connected = true;
	child.pid = pid;
	child.exitCode = null;
	child.signalCode = null;
	child.send = () => true;
	child.kill = () => true;
	return child;
}

function delay(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}
