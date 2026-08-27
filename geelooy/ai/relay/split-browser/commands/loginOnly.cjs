#!/usr/bin/env node
//B"H
// Boruch Hashem
// Blessed is He

const { loadConfig } = require("../config.cjs");
const { ManualLoginGate } = require("./ManualLoginGate.cjs");

/** The visible login chamber closes as soon as redacted authentication is true. */
async function main() {
	const result = await new ManualLoginGate().authenticate(loadConfig());
	console.log(JSON.stringify(result, null, 2));
}

main().catch(error => {
	console.error(JSON.stringify({
		ok: false,
		status: error?.code || "manual_login_failed"
	}, null, 2));
	process.exitCode = 1;
});
