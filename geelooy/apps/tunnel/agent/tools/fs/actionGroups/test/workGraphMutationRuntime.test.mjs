//B"H
// Boruch Hashem
// Blessed is He

import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const Harness = require("./workGraphHarness.js");
const Scenario = require("./workGraphMutationScenario.js");

/**
 * @file Keeps the full mutation provenance scenario as a permanent regression gate.
 * @description The Awtsmoos renews the file but never loses its causal thread;
 * Awtsmoos.com proves each mutation before the Chronicle is trusted in live dispatch.
 */
async function main() {
	const sandbox = Harness.createSandbox();
	try {
		await Scenario.run({
			...sandbox.config,
			logicalAgentId: "agent:test",
			agentSessionId: "session:test",
			missionId: "mission:test"
		});
		console.log(JSON.stringify({ ok: true, suite: "work-graph-mutation-runtime" }));
	} finally {
		Harness.cleanupSandbox(sandbox);
	}
}

main().catch(error => {
	console.error(error?.stack || error);
	process.exitCode = 1;
});
