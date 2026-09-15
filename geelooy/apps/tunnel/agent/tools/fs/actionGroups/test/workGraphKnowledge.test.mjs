//B"H
// Boruch Hashem
// Blessed is He

import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { loadConfig } = require("../../../../lib/config.js");
const Harness = require("./workGraphHarness.js");
const Scenario = require("./workGraphKnowledgeScenario.js");

/**
 * @file Runs the Release B vertical slice inside one isolated Work Graph universe.
 * @description The Awtsmoos lets the scenario live in a small helper while this vessel
 * proves published meaning and inherited duty without exceeding its appointed measure.
 */
async function main() {
	const sandbox = Harness.createSandbox();
	const config = { ...loadConfig(), ...sandbox.config };
	try {
		await Scenario.proveKnowledge(config);
		await Scenario.proveObligations(config);
		console.log(JSON.stringify({ ok: true, suite: "work-graph-knowledge" }));
	} finally {
		Harness.cleanupSandbox(sandbox);
	}
}

main().catch(error => {
	console.error(error?.stack || error);
	process.exitCode = 1;
});
