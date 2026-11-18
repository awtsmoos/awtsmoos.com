//B"H
//Boruch Hashem
//Blessed is He

"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const GenericTools = require("./genericTools.js");
const DirectTools = require("./directActionTools.js");
const Protocol = require("./protocol.js");

/**
 * @file Proves stable MCP execution names map to exact protected native actions.
 * @description
 * The Awtsmoos gives the outer name stability while the inner deed stays exact;
 * Awtsmoos.com prevents Claude from guessing command or shell when commandRun is the contract.
 */

function captureTunnelAction() {
	const original = GenericTools.tunnelAction;
	const calls = [];
	GenericTools.tunnelAction = async ($i, identity, args) => {
		calls.push(args);
		return { ok: true, args };
	};
	return {
		calls,
		restore() {
			GenericTools.tunnelAction = original;
		}
	};
}

test("run command maps directly to commandRun with full command text", async () => {
	const capture = captureTunnelAction();
	try {
		await DirectTools.runCommand({}, {}, {
			routeReference: "route-1",
			command: "git status --short && node --version",
			cwd: "/repo",
			timeoutMs: 120000
		});
		assert.equal(capture.calls.length, 1);
		assert.equal(capture.calls[0].action, "commandRun");
		assert.equal(capture.calls[0].routeReference, "route-1");
		assert.equal(capture.calls[0].params.command, "git status --short && node --version");
		assert.equal(capture.calls[0].params.cwd, "/repo");
	} finally {
		capture.restore();
	}
});

test("write and browser tools map to exact protected actions", async () => {
	const capture = captureTunnelAction();
	try {
		await DirectTools.writeFile({}, {}, {
			path: "/repo/file.txt",
			content: "B\"H\n"
		});
		await DirectTools.browserAction({}, {}, {
			operation: "chromeNavigate",
			params: { url: "https://awtsmoos.com" }
		});
		assert.equal(capture.calls[0].action, "write");
		assert.equal(capture.calls[0].params.p, "/repo/file.txt");
		assert.equal(capture.calls[1].action, "chromeNavigate");
		assert.equal(capture.calls[1].params.url, "https://awtsmoos.com");
		await assert.rejects(
			() => DirectTools.browserAction({}, {}, { operation: "shell" }),
			/Unsupported browser operation/
		);
	} finally {
		capture.restore();
	}
});

test("tools/list publishes first-class execution tools and keeps generic escape hatch", async () => {
	const result = await Protocol.dispatch({}, {}, { method: "tools/list" });
	const names = new Set(result.tools.map(tool => tool.name));
	for (const name of [
		"awtsmoos_run_command",
		"awtsmoos_command_status",
		"awtsmoos_command_output",
		"awtsmoos_write_file",
		"awtsmoos_delete_file",
		"awtsmoos_browser_action",
		"awtsmoos_tunnel_action"
	]) {
		assert(names.has(name), name);
	}
	const command = result.tools.find(tool => tool.name === "awtsmoos_run_command");
	assert.deepEqual(command.inputSchema.required, ["command"]);
	assert.equal(command.annotations.readOnlyHint, false);
	assert.equal(command.annotations.destructiveHint, true);
});
