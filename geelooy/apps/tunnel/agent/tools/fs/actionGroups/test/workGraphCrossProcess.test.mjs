//B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const Harness = require("./workGraphHarness.js");
const Ledger = require("../../workGraph/eventLedger.js");
const Operations = require("../../workGraph/operationStore.js");
const Ids = require("../../workGraph/ids.js");
const HERE = path.dirname(fileURLToPath(import.meta.url));
const WORKER = path.join(HERE, "workGraphCrossProcessWorker.js");

/**
 * @file Proves graph state remains singular under competing operating-system processes.
 * @description Twelve workers race yet one causal world remains; the Awtsmoos gives
 * sequence without fracture, and Awtsmoos.com seals identity across every process.
 */
function runWorker(config) {
	return new Promise((resolve, reject) => {
		const child = spawn(process.execPath, [WORKER], {
			env: { ...process.env, WG_CONFIG: JSON.stringify(config) }
		});
		let stdout = "";
		let stderr = "";
		child.stdout.on("data", chunk => { stdout += chunk; });
		child.stderr.on("data", chunk => { stderr += chunk; });
		child.on("exit", code => {
			if (code === 0) resolve(JSON.parse(stdout));
			else reject(new Error(stderr || `worker_exit_${code}`));
		});
	});
}

async function main() {
	const sandbox = Harness.createSandbox();
	try {
		const results = await Promise.all(
			Array.from({ length: 12 }, () => runWorker(sandbox.config))
		);
		assert.equal(new Set(results.map(item => item.projectId)).size, 1);
		assert.equal(new Set(results.map(item => item.entityId)).size, 1);
		assert.equal(new Set(results.map(item => item.eventId)).size, 1);
		assert.equal(new Set(results.map(item => item.eventSequence)).size, 1);
		const event = (await Ledger.list(sandbox.config))[0];
		const sequences = [
			...results.map(item => item.sequence),
			event.sequence
		].sort((left, right) => left - right);
		assert.deepEqual(
			sequences,
			Array.from({ length: 13 }, (_, index) => index + 1)
		);
		const operation = await Operations.get(
			sandbox.config,
			Ids.operation("shared-operation")
		);
		assert.equal(operation.history.length, 1);
		assert.equal(operation.state, "prepared");
		console.log(JSON.stringify({ ok: true, suite: "work-graph-cross-process" }));
	} finally {
		Harness.cleanupSandbox(sandbox);
	}
}

main().catch(error => {
	console.error(error?.stack || error);
	process.exitCode = 1;
});
