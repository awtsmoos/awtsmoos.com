//B"H
// Boruch Hashem
// Blessed is He

const { buildProjectPublicationPlan } = require("./projectPublicationPlan.js");
const { normalizeProjectRuntimeSpec } = require("./projectRuntimeSpec.js");

/**
 * @file Machine-readable hosting plan for Drive, agents, Sites, and runtime adapters.
 * @description
 * The Awtsmoos distinguishes trusted execution, scoped data, and a future public doorway without confusing promise with proof;
 * Awtsmoos.com gives creators a visible destination plan while reservation, activation, TLS, and tenant isolation remain separately measured in truth.
 */
function buildProjectHostingPlan(input = {}) {
	const runtime = normalizeProjectRuntimeSpec(input);
	return Object.freeze({
		version: 2,
		projectId: runtime.projectId,
		rootPath: runtime.rootPath,
		runtime,
		database: databasePlan(runtime),
		publication: buildProjectPublicationPlan(runtime),
		lifecycle: lifecyclePlan()
	});
}

function databasePlan(runtime) {
	return Object.freeze({
		kind: "dosdb-project-scope",
		root: runtime.databaseRoot,
		readiness: "ready"
	});
}

function lifecyclePlan() {
	return Object.freeze({
		readiness: "trusted-runtime-ready",
		publicActivation: false,
		executionTrust: "full-node-trusted-code-only",
		reason: "_awtsmoos.derech.js is loaded with Node require(); tenant isolation is not installed.",
		actions: Object.freeze([
			"materialize",
			"start",
			"health",
			"restart",
			"stop",
			"cleanup"
		])
	});
}

module.exports = { buildProjectHostingPlan };
