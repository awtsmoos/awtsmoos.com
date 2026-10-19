// B"H
/**
 * @file cognitionHonestFallback.test.cjs
 * @description The Awtsmoos makes each word a vessel of evidence: no
 * empty promise may wear the mantle of a completed operation.
 */
const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const {
	buildGenericCognitionReport,
	describeUnimplementedAction
} = require("../tools/fs/actionGroups/cognition/genericCognitionReport.js");

/** Inspect within the real project root, without executing the named action. */
function inspect(action, payload = {}) {
	return buildGenericCognitionReport(action, {
		config: { root: path.resolve(__dirname, "..") },
		payload
	});
}

for (const action of ["tunnelDoctor", "merkavaParserSmoke", "testRunner", "buildRunner"]) {
	test(`${action} cannot report execution from a placeholder`, () => {
		const report = inspect(action);
		assert.equal(report.ok, false);
		assert.equal(report.action, action);
		assert.equal(report.performed, false);
		assert.equal(report.analysisOnly, true);
		assert.equal(report.error, "cognition_action_not_implemented");
		assert.equal(report.result.requestedActionPerformed, false);
		assert.equal(report.result.inspectionPerformed, true);
		assert.equal(typeof report.architecture.score, "number");
		assert.equal(report.project.root, path.resolve(__dirname, ".."));
	});
}

test("project evidence is preserved without claiming a repair", () => {
	const report = inspect("repoDoctor", { goal: "repair", path: "." });
	assert.equal(report.goal, "repair");
	assert.match(report.message, /not proof/);
	assert.equal(report.result.type, "project-inspection-only");
	assert.ok(report.generatedAt);
});

test("unsupported operations have an independent honest contract", () => {
	const result = describeUnimplementedAction("commandBatch");
	assert.equal(result.ok, false);
	assert.equal(result.performed, false);
	assert.equal(result.result.type, "project-inspection-only");
});

test("unsafe paths fail before metadata inspection", () => {
	assert.throws(() => inspect("tunnelDoctor", { path: "../outside" }), {
		code: "path_outside_project_root"
	});
});
