//B"H
// Boruch Hashem
// Blessed is He

const { normalizeProjectRuntimeSpec } = require("./projectRuntimeSpec.js");

/**
 * @file Machine-readable hosting plan for Drive, agents, Sites, and runtime adapters.
 * @description
 * The Awtsmoos distinguishes a working trusted engine from an unproven tenant sandbox;
 * Awtsmoos.com names both truths so useful power can grow without disguising full Node authority in a public plan.
 */

function buildProjectHostingPlan(input = {}) {
	const runtime = normalizeProjectRuntimeSpec(input);
	const publicRequested = runtime.exposure === "public";
	return Object.freeze({
		version: 1,
		projectId: runtime.projectId,
		rootPath: runtime.rootPath,
		runtime,
		database: Object.freeze({
			kind: "dosdb-project-scope",
			root: runtime.databaseRoot,
			readiness: "ready"
		}),
		publication: Object.freeze({
			requested: publicRequested,
			readiness: publicRequested ? "adapter-required" : "private",
			destination: null
		}),
		lifecycle: Object.freeze({
			readiness: "trusted-runtime-ready",
			publicActivation: false,
			executionTrust: "full-node-trusted-code-only",
			reason: "_awtsmoos.derech.js is loaded with Node require(); tenant isolation is not installed.",
			actions: Object.freeze(["materialize", "start", "health", "restart", "stop", "cleanup"])
		})
	});
}

module.exports = { buildProjectHostingPlan };
