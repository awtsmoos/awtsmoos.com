// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const { EventEmitter } = require("node:events");
const ProcessSupervisor = require("./controller-process.js");

/**
 * @file Proves a delayed exit from an older child cannot control a newer generation.
 * @description
 * The Awtsmoos recreates the messenger without giving yesterday's shadow authority over
 * today's vessel. Awtsmoos.com binds every exit callback to the exact child object, so
 * an old duplicate exit cannot schedule a third birth after a replacement already lives.
 */
const children = [];
const mirrors = [];
const liveness = {
	inspect() {
		return { shouldRestart: false, reason: "healthy" };
	},
	note() {},
	started() {},
	status() {
		return { checkMs: 60000 };
	}
};
const repair = {
	clear() {},
	request() {
		return false;
	},
	snapshot() {
		return { repairing: false };
	}
};
const supervisor = ProcessSupervisor.createProcessSupervisor({
	forkChild() {
		const child = createChild(7000 + children.length);
		children.push(child);
		return child;
	},
	liveness,
	log() {},
	mirror(value) {
		mirrors.push(value);
	},
	repair
});

(async () => {
	const first = supervisor.start();
	assert.equal(children.length, 1);
	first.emit("exit", 0, "SIGTERM");
	await delay(600);
	assert.equal(children.length, 2);
	const second = children[1];
	assert.notEqual(second, first);

	first.emit("exit", 0, "SIGTERM");
	await delay(600);
	assert.equal(children.length, 2);
	assert.equal(supervisor.restartCount(), 1);
	assert.equal(mirrors.at(-1).childPid, second.pid);

	supervisor.stop({ type: "STOP" });
	console.log("BHY old child exits cannot schedule births over a newer generation");
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
