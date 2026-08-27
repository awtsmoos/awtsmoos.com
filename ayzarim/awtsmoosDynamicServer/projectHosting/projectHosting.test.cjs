//B"H
// Boruch Hashem
// Blessed is He

const test = require("node:test");
const assert = require("node:assert/strict");
const { normalizeProjectPath, projectDatabaseRoot } = require("./projectIdentity.js");
const { normalizeProjectRuntimeSpec } = require("./projectRuntimeSpec.js");
const { ProjectDatabaseScope } = require("./ProjectDatabaseScope.js");
const { buildProjectHostingPlan } = require("./projectHostingPlan.js");

/**
 * @file Proof that hosted-project authority remains declarative, owner-scoped, and truthfully staged.
 * @description
 * The Awtsmoos reveals trusted runtime power without disguising public routing or tenant isolation;
 * Awtsmoos.com proves each boundary separately, so future adapters cannot erase the covenant of verification.
 */

test("runtime spec fixes the Awtsmoos route file and owner-scoped database root", () => {
	const spec = normalizeProjectRuntimeSpec({ projectId: "my-site", ownerScope: "alpha", rootPath: "sites/my-site", exposure: "public" });
	assert.equal(spec.routeFile, "_awtsmoos.derech.js");
	assert.match(spec.databaseRoot, /^\/_projects\/owner-[a-f0-9]{24}\/my-site$/);
	assert.equal(spec.exposure, "public");
});

test("equal project ids under different owners never share a database root", () => {
	assert.notEqual(projectDatabaseRoot("site", "alpha"), projectDatabaseRoot("site", "beta"));
});

test("runtime spec rejects shell and secret-bearing declarations", () => {
	assert.throws(() => normalizeProjectRuntimeSpec({ projectId: "site", command: "node server.js" }), /Forbidden runtime field/);
	assert.throws(() => normalizeProjectRuntimeSpec({ projectId: "site", bindings: { apiKey: "hidden" } }), /Forbidden runtime field/);
});

test("project paths reject absolute and traversal forms", () => {
	assert.throws(() => normalizeProjectPath("../other"), /traverse/);
	assert.throws(() => normalizeProjectPath("/etc"), /relative/);
	assert.equal(normalizeProjectPath("src/api"), "src/api");
});

test("database scope prefixes every operation with owner and project namespace", async () => {
	const calls = [];
	const database = new Proxy({}, { get: (_target, method) => (...args) => { calls.push([String(method), ...args]); return Promise.resolve(args[0]); } });
	const scope = new ProjectDatabaseScope(database, "friend-site", { ownerScope: "alpha" });
	await scope.write("profiles/me", { name: "Friend" });
	await scope.get("profiles/me");
	const roots = calls.map(call => call[1]);
	assert.equal(roots[0], roots[1]);
	assert.match(roots[0], /^\/_projects\/owner-[a-f0-9]{24}\/friend-site\/profiles\/me$/);
});

test("hosting plan distinguishes trusted lifecycle from public activation", () => {
	const plan = buildProjectHostingPlan({ projectId: "friend-site", ownerScope: "alpha", rootPath: "sites/friend-site", exposure: "public" });
	assert.equal(plan.database.readiness, "ready");
	assert.equal(plan.lifecycle.readiness, "trusted-runtime-ready");
	assert.equal(plan.lifecycle.publicActivation, false);
	assert.equal(plan.lifecycle.executionTrust, "full-node-trusted-code-only");
	assert.deepEqual(plan.lifecycle.actions, ["materialize", "start", "health", "restart", "stop", "cleanup"]);
	assert.equal(plan.publication.readiness, "adapter-required");
});
