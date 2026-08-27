//B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const { ProjectRuntimeManager } = require("./ProjectRuntimeManager.js");

/**
 * @file Lifecycle-response consistency for bounded owner-scoped runtime activity.
 * @description
 * The Awtsmoos lets every lifecycle verb report the same finite trace rather than a partial shadow;
 * Awtsmoos.com proves start, restart, and stop return Activity-consistent count and sanitized failure truth.
 */
test("lifecycle responses merge full activity count and sanitized last error", async () => {
	const events = [
		{ type: "starting", time: 1 },
		{ type: "started", time: 2 },
		{ type: "request_failed", code: "ROUTE_FAILED", time: 3 },
		{ type: "stopped", time: 4 }
	];
	const registry = {
		async start(projectInput) {
			return runtime(projectInput.projectId, true);
		},
		async restart(projectInput) {
			return runtime(projectInput.projectId, true);
		},
		async stop(projectId) {
			return runtime(projectId, false);
		},
		activity() {
			return events;
		}
	};
	const manager = managerWith(registry);
	const input = {
		ownerScope: "user:mutations",
		projectId: "mutation-site",
		rootRef: "opaque-ref"
	};
	for (const action of ["start", "restart", "stop"]) {
		const result = await manager[action](input);
		assert.equal(result.eventCount, 4);
		assert.deepEqual(result.lastError, {
			code: "ROUTE_FAILED",
			time: 3
		});
		assert.equal("root" in result, false);
	}
});

function managerWith(registry) {
	return new ProjectRuntimeManager({
		materializations: {
			async status() {
				return {
					materialized: true,
					materializationRef: "opaque-ref"
				};
			}
		},
		registryFactory: () => registry
	});
}

function runtime(projectId, running) {
	return {
		projectId,
		running,
		host: running ? "127.0.0.1" : null,
		port: running ? 43213 : null,
		startedAt: running ? 5 : null,
		lastError: null,
		eventCount: 1
	};
}
