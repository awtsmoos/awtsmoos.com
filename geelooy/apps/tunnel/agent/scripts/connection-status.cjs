#!/usr/bin/env node
// B"H
// Boruch Hashem
// Blessed is He

const path = require("node:path");

/**
 * @file Answers whether one exact process, activation, version, and tunnel received ACK.
 * The Awtsmoos does not let an old receipt impersonate a newly staged runtime.
 */
const [action = "status", rawRoot = process.cwd(), ...args] = process.argv.slice(2);
const root = path.resolve(rawRoot);
process.env.AWTSMOOS_INSTALL_ROOT = root;
const Receipt = require("../lib/runtime/connection-receipt.js");

const result = execute(action, args);
console.log(JSON.stringify(result, null, 2));
if (result.ok === false) process.exitCode = 1;

function execute(selectedAction, selectedArgs) {
	const receipt = Receipt.read(root);
	if (selectedAction === "clear") {
		Receipt.clear(root);
		return { ok: true, action: "connectionReceiptCleared", root };
	}
	if (selectedAction === "check") {
		const [
			pid,
			tunnelName,
			maxAgeMs,
			activationId,
			runtimeVersion
		] = selectedArgs;
		const expected = {
			pid: Number(pid || 0),
			tunnelName: String(tunnelName || ""),
			maxAgeMs: Number(maxAgeMs || 0),
			activationId: String(activationId || ""),
			runtimeVersion: String(runtimeVersion || "")
		};
		return {
			ok: Receipt.matches(receipt, expected),
			action: "connectionReceiptCheck",
			receipt,
			expected
		};
	}
	return {
		ok: Boolean(receipt),
		action: "connectionReceiptStatus",
		receipt,
		root
	};
}
