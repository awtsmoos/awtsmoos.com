//B"H
//Boruch Hashem
//Blessed is He

"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const DeviceTools = require("./deviceTools.js");
const { diagnoseDevice } = require("./diagnostics.js");
const { tools } = require("./toolCatalog.js");

/**
 * @file Guards route, manifest, scope, grant, and execution evidence independently.
 * @description
 * The Awtsmoos lets each witness speak only what it knows;
 * Awtsmoos.com never turns a stale projection into a false command-no.
 */

test("manifest commandRun repairs a false-negative projected capability", () => {
	const executable = DeviceTools.executableCapabilities({
		capabilities: { commandRun: false, fsRead: true },
		actionManifest: {
			command: ["commandRun", "commandJobStatus", "commandJobOutputPage"]
		}
	});
	assert.equal(executable.commandRun, true);
	assert.equal(executable.runtime, true);
});

test("doctor separates executable testimony, authority, and fresh execution", () => {
	const native = {
		vesselType: "native",
		connected: true,
		livenessState: "connected",
		access: "shared",
		permissions: ["tunnel.read"]
	};
	const executable = { commandRun: true, fsRead: true };
	const denied = diagnoseDevice(native, executable, { scopes: ["tunnel.read"] });
	assert.equal(denied.canAttemptNativeCommand, false);
	assert.equal(denied.commandSuccessCertified, false);
	assert(denied.warnings.includes("PRINCIPAL_COMMAND_SCOPE_MISSING"));
	assert(denied.warnings.includes("DEVICE_COMMAND_GRANT_MISSING"));
	assert(!denied.warnings.includes("COMMAND_NOT_IN_EXECUTABLE_MANIFEST"));
	const eligible = diagnoseDevice(
		{ ...native, permissions: ["tunnel.read", "tunnel.command"] },
		executable,
		{ scopes: ["tunnel.read", "tunnel.command"] }
	);
	assert.equal(eligible.canAttemptNativeCommand, true);
	assert.equal(eligible.commandSuccessCertified, false);
	assert(eligible.warnings.includes("FRESH_COMMAND_SUCCESS_NOT_PROVED"));
	const proved = diagnoseDevice({
		...native,
		permissions: ["tunnel.command"],
		executionHealthy: true,
		executionHealthFresh: true,
		acceptanceHealthy: true,
		acceptanceHealthFresh: true
	}, executable, { scopes: ["tunnel.command"] });
	assert.equal(proved.commandSuccessCertified, true);
});

test("doctor warns only when command is absent from executable testimony", () => {
	const result = diagnoseDevice(
		{ vesselType: "native", connected: true, access: "owned" },
		{ commandRun: false },
		{ scopes: ["tunnel.command"] }
	);
	assert(result.warnings.includes("COMMAND_NOT_IN_EXECUTABLE_MANIFEST"));
});

test("doctor is discoverable as an explicitly read-only MCP tool", () => {
	const tool = tools.find(item => item.name === "awtsmoos_tunnel_doctor");
	assert(tool);
	assert.deepEqual(tool.annotations, {
		readOnlyHint: true,
		destructiveHint: false,
		openWorldHint: false
	});
});
