// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Startup = require("../lib/runtime/main-components-startup.js");

/**
 * @file Proves final composition cannot omit project-root readiness dependencies.
 * @description
 * The Awtsmoos renews the final dependency vessel before any socket may open.
 * Awtsmoos.com binds configuration and workspace proof explicitly, then rejects a
 * composition missing either one instead of registering a half-ready candidate.
 */
const rootHealth = { probeProjectRoot() {} };
const config = { ROOT: "/install" };
const connection = { connect() {} };
const dependencies = Startup.createStartupDependencies({
	config,
	AGENT_VERSION: "test-version",
	Limits: {},
	ProjectRootHealth: rootHealth,
	HistoryCleanup: {},
	CommandReconciliation: {},
	startLocalApiServer() {},
	Boot: {},
	WebsiteMissionRecovery: { recover() {} },
	Updates: {},
	DeviceIdentity: {},
	openHostedControl() {}
}, {
	loadConfig() {},
	log() {}
}, connection);

assert.equal(dependencies.config, config);
assert.equal(dependencies.ProjectRootHealth, rootHealth);
assert.equal(typeof dependencies.WebsiteMissionRecovery.recover, "function");
assert.equal(dependencies.connection, connection);
assert.equal(Startup.validateStartupDependencies(dependencies), dependencies);
assert.throws(
	() => Startup.validateStartupDependencies({
		...dependencies,
		ProjectRootHealth: undefined
	}),
	error => error.code === "STARTUP_DEPENDENCIES_MISSING" &&
		error.missing.includes("ProjectRootHealth")
);
assert.throws(
	() => Startup.validateStartupDependencies({
		...dependencies,
		config: undefined
	}),
	error => error.code === "STARTUP_DEPENDENCIES_MISSING" &&
		error.missing.includes("config")
);

console.log(JSON.stringify({
	ok: true,
	suite: "main-components-startup-dependencies",
	projectRootHealthBound: true,
	installRootConfigBound: true,
	missingDependencyRejected: true
}, null, 2));
