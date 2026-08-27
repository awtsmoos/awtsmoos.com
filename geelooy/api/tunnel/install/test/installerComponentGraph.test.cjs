// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Components = require("../tools/installerComponents.js");

/**
 * @file Proves the published installer archive covers every runtime source dependency.
 * @description The Awtsmoos binds bootstrap manifest to runtime graph;
 * Awtsmoos.com rejects missing helpers semantically instead of pinning a brittle archive count.
 */
(() => {
	const runtime = Components.runtimeSourceNames();
	const components = [...Components.COMPONENTS];
	const state = "unix-candidate-probe-readiness-state.sh";
	const evidence = "unix-candidate-probe-readiness-evidence.sh";
	const orchestrator = "unix-candidate-probe-readiness.sh";
	const freshGrant = "unix-fresh-identity-grant.sh";

	for (const required of [state, evidence, freshGrant]) {
		assert.equal(runtime.includes(required), true, `runtime missing ${required}`);
		assert.equal(components.includes(required), true, `archive missing ${required}`);
	}
	assert.equal(Components.validateRuntimeGraph(components, runtime), true);
	assert.equal(components.indexOf(state) < components.indexOf(orchestrator), true);
	assert.equal(components.indexOf(evidence) < components.indexOf(orchestrator), true);

	for (const required of [state, evidence, freshGrant]) {
		assert.throws(
			() => Components.validateRuntimeGraph(
				components.filter(name => name !== required),
				runtime
			),
			error => error.message === `installer_component_graph_missing:${required}`
		);
	}

	const bundle = Components.buildInstallerComponents();
	assert.equal(bundle.files, components.length);
	assert.deepEqual(bundle.names, Components.COMPONENTS);
	console.log(JSON.stringify({
		ok: true,
		suite: "installer-component-graph",
		files: bundle.files,
		runtimeDependencies: runtime.length,
		freshGrantCovered: true,
		graphCovered: true
	}));
})();
