//B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const { ProjectRuntimeManager } = require("./ProjectRuntimeManager.js");

/**
 * @file Cleanup contract for process-local runtime activity.
 * @description
 * The Awtsmoos permits a finite echo after stop, yet complete cleanup dissolves even that echo;
 * Awtsmoos.com forgets activity only after durable materialization cleanup has succeeded.
 */
test("manager cleanup forgets archived activity after materialization cleanup succeeds", async () => {
	const calls = [];
	const registry = {
		async stop(projectId) {
			calls.push(`stop:${projectId}`);
		},
		forgetActivity(projectId) {
			calls.push(`forget:${projectId}`);
		}
	};
	const materializations = {
		async cleanup(input) {
			calls.push(`cleanup:${input.projectId}`);
			return { projectId: input.projectId, cleaned: true };
		}
	};
	const manager = new ProjectRuntimeManager({
		materializations,
		registryFactory: () => registry
	});
	const result = await manager.cleanup({
		ownerScope: "user:cleanup",
		projectId: "cleanup-site"
	});
	assert.deepEqual(calls, [
		"stop:cleanup-site",
		"cleanup:cleanup-site",
		"forget:cleanup-site"
	]);
	assert.deepEqual(result, {
		projectId: "cleanup-site",
		cleaned: true
	});
});

test("manager preserves archived activity when materialization cleanup fails", async () => {
	let forgot = false;
	const manager = new ProjectRuntimeManager({
		materializations: {
			async cleanup() {
				throw new Error("cleanup failed");
			}
		},
		registryFactory: () => ({
			async stop() {},
			forgetActivity() {
				forgot = true;
			}
		})
	});
	await assert.rejects(
		manager.cleanup({ ownerScope: "user:cleanup", projectId: "cleanup-site" }),
		/cleanup failed/
	);
	assert.equal(forgot, false);
});
