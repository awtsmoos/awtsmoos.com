//B"H
//Boruch Hashem
//Blessed be He

"use strict";

/**
 * @file staticServerLifecycle.test.js
 * @description Proves scaled HTTP workers can relinquish background task polling.
 */

const assert = require("node:assert/strict");
const test = require("node:test");
const {
	taskRunnerEnabled
} = require("../staticServerLifecycle.js");

test("embedded task runner remains enabled for backward-compatible workers", () => {
	assert.equal(taskRunnerEnabled({}), true);
});

test("HTTP-only workers can disable embedded background polling explicitly", () => {
	assert.equal(
		taskRunnerEnabled({ AWTSMOOS_DISABLE_TASK_RUNNER: "true" }),
		false
	);
});

test("only the exact true flag disables background polling", () => {
	assert.equal(taskRunnerEnabled({ AWTSMOOS_DISABLE_TASK_RUNNER: "false" }), true);
	assert.equal(taskRunnerEnabled({ AWTSMOOS_DISABLE_TASK_RUNNER: "1" }), true);
});
