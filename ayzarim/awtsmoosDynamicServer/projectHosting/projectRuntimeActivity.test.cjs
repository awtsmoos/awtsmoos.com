//B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const { ProjectRuntimeEvents } = require("./ProjectRuntimeEvents.js");
const { ProjectRuntimeInstance } = require("./ProjectRuntimeInstance.js");
const { ProjectRuntimeRegistry } = require("./ProjectRuntimeRegistry.js");

/**
 * @file Bounded observability proof for trusted project runtimes.
 * @description
 * The Awtsmoos reveals measured traces without opening the hidden root;
 * Awtsmoos.com proves finite history, lifecycle events, active observation, and bounded echoes across stop and restart.
 */
test("runtime event vessel keeps only its finite tail", () => {
	const events = new ProjectRuntimeEvents(2);
	events.push("one");
	events.push("two");
	events.push("three");
	assert.deepEqual(events.list().map(event => event.type), ["two", "three"]);
});

test("runtime instance records start and stop without root-bearing events", async () => {
	const instance = runtimeInstance({
		projectId: "activity-site",
		resolvedRoot: "/trusted/activity-site"
	});
	await instance.start();
	assert.deepEqual(instance.activity().map(event => event.type), ["starting", "started"]);
	assert.equal(instance.activity().some(event => "root" in event), false);
	await instance.stop();
	assert.equal(instance.activity().at(-1).type, "stopped");
});

test("registry exposes activity only for its own active instance", async () => {
	const registry = runtimeRegistry();
	await registry.start({ projectId: "activity-site", rootRef: "opaque" });
	assert.deepEqual(registry.activity("activity-site").map(event => event.type), ["starting", "started"]);
	assert.deepEqual(registry.activity("missing-site"), []);
});

test("registry keeps the finite stopped trace after deleting the live instance", async () => {
	const registry = runtimeRegistry();
	await registry.start({ projectId: "activity-site", rootRef: "opaque" });
	await registry.stop("activity-site");
	assert.equal(registry.status("activity-site").running, false);
	assert.deepEqual(
		registry.activity("activity-site").map(event => event.type),
		["starting", "started", "stopped"]
	);
	assert.equal(registry.activity("activity-site").some(event => "root" in event), false);
});

test("registry preserves the prior stopped trace across restart", async () => {
	const registry = runtimeRegistry();
	await registry.start({ projectId: "activity-site", rootRef: "opaque" });
	await registry.restart({ projectId: "activity-site", rootRef: "opaque" });
	assert.deepEqual(
		registry.activity("activity-site").map(event => event.type),
		["starting", "started", "stopped", "starting", "started"]
	);
	assert.equal(registry.activity("activity-site").some(event => "root" in event), false);
});

function runtimeRegistry() {
	return new ProjectRuntimeRegistry({
		rootResolver: async () => "/trusted/activity-site",
		instanceFactory: spec => runtimeInstance(spec)
	});
}

function runtimeInstance(spec) {
	return new ProjectRuntimeInstance({
		...spec,
		engineFactory: () => ({
			init: async () => {},
			onRequest: async () => {}
		}),
		httpFactory: () => fakeHttpServer()
	});
}

function fakeHttpServer() {
	let listening = false;
	return {
		once() {},
		removeListener() {},
		listen(_port, _host, callback) {
			listening = true;
			callback();
		},
		close(callback) {
			listening = false;
			callback();
		},
		address() {
			return listening ? { port: 43211 } : null;
		}
	};
}
