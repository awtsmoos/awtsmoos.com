// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const root = fs.mkdtempSync(path.join(os.tmpdir(), "awts-command-response-"));
const previousRoot = process.env.AWTSMOOS_INSTALL_ROOT;
process.env.AWTSMOOS_INSTALL_ROOT = root;
fs.writeFileSync(path.join(root, "config.json"), JSON.stringify({
	tunnelName: "awt-command-response-test",
	root
}));

const Envelope = require("../lib/runtime/envelope.js");
const Validation = require(
	"../../../../../ayzarim/awtsmoosDynamicServer/websocket/apps/tunnelRelay/validation.js"
);

/**
 * @file Proves compact command responses retain the exact identity required for ACK settlement.
 * @description The Awtsmoos carries cwd and command through every native response vessel;
 * Awtsmoos.com keeps strict relay validation while truthful completions can finally release custody.
 */
try {
	const cwd = path.join(root, "work");
	const command = "printf 'first line'\nprintf 'second line'";
	const payload = {
		action: "command",
		clientRequestId: "client-command-response-1",
		command,
		controlRequestId: "req-command-response-1",
		cwd,
		nonce: "nonce-command-response-1",
		tunnelName: "awt-command-response-test"
	};
	const response = Envelope.responseEnvelope(
		{ id: "transport-command-response-1" },
		payload,
		{ ok: true, action: "command" },
		Date.now(),
		() => ({ inflight: 0, queued: 0 })
	);
	assert.equal(response.cwd, cwd);
	assert.equal(response.command, command);
	const expected = {
		clientRequestId: payload.clientRequestId,
		command,
		controlRequestId: payload.controlRequestId,
		cwd,
		nonce: payload.nonce,
		requestedAction: "command",
		tunnelName: "awt-command-response-test"
	};
	assert.equal(Validation.validateTunnelResponse(expected, response).ok, true);
	const wrongCwd = Validation.validateTunnelResponse(expected, {
		...response,
		cwd: `${cwd}-wrong`
	});
	assert.equal(wrongCwd.ok, false);
	assert.equal(wrongCwd.response.cwdMismatch, true);
	const wrongCommand = Validation.validateTunnelResponse(expected, {
		...response,
		command: `${command}\necho wrong`
	});
	assert.equal(wrongCommand.ok, false);
	assert.equal(wrongCommand.response.commandMismatch, true);
	const stat = Envelope.responseEnvelope(
		{ id: "transport-stat-no-command" },
		{ action: "stat", path: "package.json" },
		{ ok: true, action: "stat", exists: true, path: "package.json" },
		Date.now(),
		() => ({ inflight: 0, queued: 0 })
	);
	assert.equal(Object.hasOwn(stat, "cwd"), false);
	assert.equal(Object.hasOwn(stat, "command"), false);
	console.log(JSON.stringify({
		ok: true,
		suite: "authoritative-command-response-correlation",
		strictValidation: true
	}));
} finally {
	if (previousRoot === undefined) delete process.env.AWTSMOOS_INSTALL_ROOT;
	else process.env.AWTSMOOS_INSTALL_ROOT = previousRoot;
	fs.rmSync(root, { recursive: true, force: true });
}
