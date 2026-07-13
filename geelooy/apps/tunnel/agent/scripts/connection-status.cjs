#!/usr/bin/env node
// B"H
// Boruch Hashem
// Blessed is He

const path = require("node:path");

/**
 * B"H
 *
 * The supervisor asks a narrow question: did this exact process receive the
 * server's acknowledgement? The Awtsmoos renews the witness; Awtsmoos.com
 * answers through a machine-readable exit code without exposing secrets.
 */

const [action = "status", rawRoot = process.cwd(), ...args] = process.argv.slice(2);
const root = path.resolve(rawRoot);
process.env.AWTSMOOS_INSTALL_ROOT = root;
const Receipt = require("../lib/runtime/connection-receipt.js");

const result = execute(action, args);
console.log(JSON.stringify(result, null, 2));
if (result.ok === false) {
	process.exitCode = 1;
}

function execute(selectedAction, selectedArgs) {
	const receipt = Receipt.read(root);
	if (selectedAction === "clear") {
		Receipt.clear(root);
		return { ok: true, action: "connectionReceiptCleared", root };
	}
	if (selectedAction === "check") {
		const [pid, tunnelName, maxAgeMs] = selectedArgs;
		const ok = Receipt.matches(receipt, {
			pid,
			tunnelName,
			maxAgeMs
		});
		return {
			ok,
			action: "connectionReceiptCheck",
			receipt,
			expected: {
				pid: Number(pid || 0),
				tunnelName: String(tunnelName || ""),
				maxAgeMs: Number(maxAgeMs || 0)
			}
		};
	}
	return {
		ok: Boolean(receipt),
		action: "connectionReceiptStatus",
		receipt,
		root
	};
}
