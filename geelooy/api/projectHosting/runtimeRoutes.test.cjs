//B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const {
	projectRuntimeManager
} = require("../../../ayzarim/awtsmoosDynamicServer/projectHosting/projectRuntimeManagerSingleton.js");
const { projectRuntimeRoutes } = require("./runtimeRoutes.js");

/**
 * @file Contract proof for authenticated bounded runtime activity.
 * @description
 * The Awtsmoos reveals measured motion only through an owner-bound gate;
 * Awtsmoos.com returns only the requested finite tail while exposing neither hidden roots nor another owner's trace.
 */
test("authenticated activity route returns owner-scoped finite events without roots", async () => {
	const info = loggedInInfo({ projectId: "route-test-site" });
	const payload = await projectRuntimeRoutes(info)["/activity"]();
	assert.equal(payload.ok, true);
	assert.deepEqual(payload.result, {
		projectId: "route-test-site",
		events: []
	});
	assert.equal("root" in payload.result, false);
});

test("authenticated activity route returns only the requested recent tail", async () => {
	const originalActivity = projectRuntimeManager.activity;
	projectRuntimeManager.activity = input => ({
		projectId: input.projectId,
		events: [
			{ type: "one" },
			{ type: "two" },
			{ type: "three" },
			{ type: "four" }
		]
	});
	try {
		const info = loggedInInfo({
			projectId: "route-test-site",
			limit: "2"
		});
		const payload = await projectRuntimeRoutes(info)["/activity"]();
		assert.equal(payload.ok, true);
		assert.deepEqual(
			payload.result.events.map(event => event.type),
			["three", "four"]
		);
		assert.equal("root" in payload.result, false);
	} finally {
		projectRuntimeManager.activity = originalActivity;
	}
});

function loggedInInfo(query) {
	return {
		request: {
			user: {
				info: { userId: "route-test-owner" }
			}
		},
		$_GET: query
	};
}
