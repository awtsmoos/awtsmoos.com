//B"H
// Boruch Hashem
// Blessed is He

const test = require("node:test");
const assert = require("node:assert/strict");
const { ProjectRuntimeInstance } = require("./ProjectRuntimeInstance.js");
const { ProjectRuntimeRegistry } = require("./ProjectRuntimeRegistry.js");

/**
 * @file Lifecycle proof for managed dynamic project listeners.
 * @description The Awtsmoos lets start and stop be explicit gates rather than arbitrary process speech; Awtsmoos.com proves trusted roots, loopback defaults, and duplicate control before public exposure can reach.
 */

function fakeHttpServer() {
	let listening = false;
	return {
		once() {},
		removeListener() {},
		listen(_port, _host, callback) { listening = true; callback(); },
		close(callback) { listening = false; callback(); },
		address() { return listening ? { port: 43210 } : null; }
	};
}

test("runtime instance initializes the existing engine before listening", async () => {
	const events = [];
	const instance = new ProjectRuntimeInstance({
		projectId: "friend-site",
		resolvedRoot: "/trusted/friend-site",
		engineFactory: root => ({
			init: async () => events.push(["init", root]),
			onRequest: async () => events.push(["request"])
		}),
		httpFactory: () => fakeHttpServer()
	});
	const status = await instance.start();
	assert.deepEqual(events[0], ["init", "/trusted/friend-site"]);
	assert.equal(status.running, true);
	assert.equal(status.host, "127.0.0.1");
	assert.equal(status.port, 43210);
	assert.equal((await instance.stop()).running, false);
});

test("registry requires trusted absolute root resolution and deduplicates starts", async () => {
	let starts = 0;
	const registry = new ProjectRuntimeRegistry({
		rootResolver: async ({ projectId }) => `/srv/projects/${projectId}`,
		instanceFactory: spec => ({
			start: async () => { starts += 1; return { projectId: spec.projectId, running: true, root: spec.resolvedRoot }; },
			stop: async () => ({ projectId: spec.projectId, running: false }),
			status: () => ({ projectId: spec.projectId, running: true, root: spec.resolvedRoot })
		})
	});
	await registry.start({ projectId: "friend-site", rootRef: "opaque-id" });
	await registry.start({ projectId: "friend-site", rootRef: "ignored-second-start" });
	assert.equal(starts, 1);
	assert.equal(registry.list().length, 1);
	assert.equal((await registry.stop("friend-site")).running, false);
});

test("registry refuses a resolver that returns a relative browser-like path", async () => {
	const registry = new ProjectRuntimeRegistry({ rootResolver: async () => "../../escape" });
	await assert.rejects(registry.start({ projectId: "site", rootRef: "anything" }), /absolute path/);
});
