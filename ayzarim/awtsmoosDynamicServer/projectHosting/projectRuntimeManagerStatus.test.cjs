//B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const { ProjectRuntimeManager } = require("./ProjectRuntimeManager.js");

/**
 * @file Health and Activity consistency for stopped trusted runtimes.
 * @description
 * The Awtsmoos lets a stopped flame leave a finite echo without pretending the flame still burns;
 * Awtsmoos.com lets Health recover the same event count and sanitized last-failure sign that Activity preserves, while roots remain hidden.
 */
test("manager status reflects archived activity and sanitized last error after stop", async () => {
	const registry = {
		status(projectId) {
			return {
				projectId,
				running: false,
				host: null,
				port: null,
				startedAt: null,
				lastError: null,
				eventCount: 0
			};
		},
		activity() {
			return [
				{ type: "starting", time: 1 },
				{ type: "started", time: 2 },
				{ type: "request_failed", code: "ROUTE_FAILED", time: 3 },
				{ type: "stopped", time: 4 }
			];
		}
	};
	const manager = new ProjectRuntimeManager({
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
	const status = await manager.status({
		ownerScope: "user:status",
		projectId: "status-site"
	});
	assert.equal(status.running, false);
	assert.equal(status.eventCount, 4);
	assert.deepEqual(status.lastError, {
		code: "ROUTE_FAILED",
		time: 3
	});
	assert.equal(status.materialized, true);
	assert.equal("root" in status, false);
});
