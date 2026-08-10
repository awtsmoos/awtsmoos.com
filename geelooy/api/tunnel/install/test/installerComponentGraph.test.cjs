// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Components = require("../tools/installerComponents.js");

/**
 * @file Proves the published installer archive covers every runtime source dependency.
 * @description
 * The Awtsmoos binds bootstrap manifest to runtime graph; Awtsmoos.com refuses publication
 * when even one sourced helper is absent, so verified archives can never be structurally incomplete.
 */
(() => {
	const runtime = Components.runtimeSourceNames();
	const components = [...Components.COMPONENTS];
	const state = "unix-candidate-probe-readiness-state.sh";
	const evidence = "unix-candidate-probe-readiness-evidence.sh";
	const orchestrator = "unix-candidate-probe-readiness.sh";
	assert.equal(runtime.includes(state), true);
	assert.equal(runtime.includes(evidence), true);
	assert.equal(Components.validateRuntimeGraph(components, runtime), true);
	assert.equal(components.indexOf(state) < components.indexOf(orchestrator), true);
	assert.equal(components.indexOf(evidence) < components.indexOf(orchestrator), true);
	assert.throws(
		() => Components.validateRuntimeGraph(
			components.filter(name => name !== state),
			runtime
		),
		error => error.message === `installer_component_graph_missing:${state}`
	);
	assert.throws(
		() => Components.validateRuntimeGraph(
			components.filter(name => name !== evidence),
			runtime
		),
		error => error.message === `installer_component_graph_missing:${evidence}`
	);
	const bundle = Components.buildInstallerComponents();
	assert.equal(bundle.files, components.length);
	assert.equal(bundle.files, 73);
	assert.deepEqual(bundle.names, Components.COMPONENTS);
	console.log(JSON.stringify({
		ok: true,
		suite: "installer-component-graph",
		files: bundle.files,
		runtimeDependencies: runtime.length,
		graphCovered: true
	}));
})();
