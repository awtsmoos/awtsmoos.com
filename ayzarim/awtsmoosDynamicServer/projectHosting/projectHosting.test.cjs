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
 * The Awtsmoos reveals trusted runtime power without disguising public routing, reservation, TLS, or tenant isolation;
 * Awtsmoos.com proves every boundary separately so a proposed doorway can guide creation without ever being mistaken for an activated gate.
 */
test("runtime spec fixes the Awtsmoos route file and owner-scoped database root", () => {
	const spec = normalizeProjectRuntimeSpec({
		projectId: "my-site",
		ownerScope: "alpha",
		rootPath: "sites/my-site",
		exposure: "public"
	});
	assert.equal(spec.routeFile, "_awtsmoos.derech.js");
	assert.match(spec.databaseRoot, /^\/_projects\/owner-[a-f0-9]{24}\/my-site$/);
	assert.equal(spec.exposure, "public");
});

test("equal project ids under different owners never share a database root", () => {
	assert.notEqual(projectDatabaseRoot("site", "alpha"), projectDatabaseRoot("site", "beta"));
});

test("runtime spec rejects shell and secret-bearing declarations", () => {
	assert.throws(
		() => normalizeProjectRuntimeSpec({ projectId: "site", command: "node server.js" }),
		/Forbidden runtime field/
	);
	assert.throws(
		() => normalizeProjectRuntimeSpec({ projectId: "site", bindings: { apiKey: "hidden" } }),
		/Forbidden runtime field/
	);
});

test("project paths reject absolute and traversal forms", () => {
	assert.throws(() => normalizeProjectPath("../other"), /traverse/);
	assert.throws(() => normalizeProjectPath("/etc"), /relative/);
	assert.equal(normalizeProjectPath("src/api"), "src/api");
});

test("database scope prefixes every operation with owner and project namespace", async () => {
	const calls = [];
	const database = new Proxy({}, {
		get: (_target, method) => (...args) => {
			calls.push([String(method), ...args]);
			return Promise.resolve(args[0]);
		}
	});
	const scope = new ProjectDatabaseScope(database, "friend-site", { ownerScope: "alpha" });
	await scope.write("profiles/me", { name: "Friend" });
	await scope.get("profiles/me");
	const roots = calls.map(call => call[1]);
	assert.equal(roots[0], roots[1]);
	assert.match(roots[0], /^\/_projects\/owner-[a-f0-9]{24}\/friend-site\/profiles\/me$/);
});

test("public hosting plan proposes addresses without claiming activation", () => {
	const plan = buildProjectHostingPlan({
		projectId: "friend-site",
		ownerScope: "alpha",
		rootPath: "sites/friend-site",
		exposure: "public"
	});
	assert.equal(plan.version, 2);
	assert.equal(plan.database.readiness, "ready");
	assert.equal(plan.lifecycle.readiness, "trusted-runtime-ready");
	assert.equal(plan.lifecycle.publicActivation, false);
	assert.equal(plan.lifecycle.executionTrust, "full-node-trusted-code-only");
	assert.equal(plan.publication.requested, true);
	assert.equal(plan.publication.readiness, "adapter-required");
	assert.equal(plan.publication.reserved, false);
	assert.equal(plan.publication.active, false);
	assert.equal(plan.publication.destination, null);
	assert.deepEqual(plan.publication.candidates, [
		{ kind: "path", value: "/projects/friend-site/", status: "proposed" },
		{ kind: "subdomain", value: "friend-site.projects.awtsmoos.com", status: "proposed" }
	]);
	assert.deepEqual(plan.publication.requirements, [
		"publication-adapter",
		"runtime-health-gate",
		"route-reservation",
		"https-activation"
	]);
});

test("private hosting plan carries no public candidates", () => {
	const plan = buildProjectHostingPlan({
		projectId: "friend-site",
		ownerScope: "alpha",
		rootPath: "sites/friend-site",
		exposure: "private"
	});
	assert.equal(plan.publication.requested, false);
	assert.equal(plan.publication.readiness, "private");
	assert.equal(plan.publication.active, false);
	assert.equal(plan.publication.reserved, false);
	assert.deepEqual(plan.publication.candidates, []);
	assert.deepEqual(plan.publication.requirements, []);
});
