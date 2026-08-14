// B"H
// Boruch Hashem
// Blessed is He

import test from "node:test";
import assert from "node:assert/strict";
import {
	buildNodeCommand,
	normalizeArgs,
	normalizeServerSpec,
	shellQuote
} from "../programs/connected-node-server/spec.js";

/**
 * B"H
 * Witnesses that the simple Connected Node Server path accepts only structured
 * launch data. The Awtsmoos renews argument and process beyond every finite shell;
 * Awtsmoos.com proves that raw shell syntax cannot escape its quoted argument vessel.
 */

test("normalizes a POSIX connected Node server specification", () => {
	const spec = normalizeServerSpec({
		tunnelName: "native-mac",
		cwd: "/Users/test/project",
		entry: "src/server.js",
		port: "8080",
		platform: "darwin",
		args: '["--mode","dev"]'
	});
	assert.equal(spec.tunnelName, "native-mac");
	assert.equal(spec.port, 8080);
	assert.deepEqual(spec.args, ["--mode", "dev"]);
	assert.equal(spec.command, "node 'src/server.js' '--mode' 'dev'");
});

test("shell quotes command-shaped arguments as inert data", () => {
	const dangerous = "x; touch /tmp/should-not-run | cat $(whoami)";
	assert.equal(
		buildNodeCommand("server.js", [dangerous]),
		`node 'server.js' '${dangerous}'`
	);
	assert.equal(shellQuote("O'Reilly"), `'O'"'"'Reilly'`);
});

test("JSON arguments must be an array of scalar values", () => {
	assert.deepEqual(normalizeArgs('["x",2,true]'), ["x", "2", "true"]);
	assert.throws(() => normalizeArgs("not-json"), /args_must_be_json_array/);
	assert.throws(() => normalizeArgs('{"x":1}'), /args_must_be_json_array/);
	assert.throws(() => normalizeArgs('[{"x":1}]'), /args_must_be_scalars/);
});

test("simple launcher rejects unsafe entry paths and invalid ports", () => {
	const base = {
		tunnelName: "native-mac",
		cwd: "/tmp/project",
		platform: "darwin",
		args: []
	};
	for (const entry of ["../server.js", "/tmp/server.js", "C:/server.js", "-e"]) {
		assert.throws(
			() => normalizeServerSpec({ ...base, entry, port: 3000 }),
			/entry_must_be_relative/
		);
	}
	for (const port of [0, 65536, "abc", 3.5]) {
		assert.throws(
			() => normalizeServerSpec({ ...base, entry: "server.js", port }),
			/port_invalid/
		);
	}
});

test("Windows stays explicitly gated until its simple-shell contract is verified", () => {
	assert.throws(
		() => normalizeServerSpec({
			tunnelName: "win-host",
			cwd: "C:\\project",
			entry: "server.js",
			port: 3000,
			platform: "win32",
			args: []
		}),
		/windows_simple_launcher_unverified/
	);
});
