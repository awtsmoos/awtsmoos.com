//B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const { loadConfig } = require("../lib/config.js");
const Actions = require("../tools/fs/actions.js");
const Harness = require("../tools/fs/actionGroups/test/workGraphHarness.js");

/**
 * @file Proves Virtual OS project navigation is an additive projection over an ordinary project.
 * @description The Awtsmoos leaves the filesystem untouched while Awtsmoos.com reveals Project,
 * Work, Agent, Smart, Context, and Why lenses from the same graph/compiler authorities.
 */
async function invoke(config, action, payload = {}) {
	return Actions.buildActions(config, { action, normalized: true, ...payload }, null)[action]();
}

async function main() {
	const sandbox = Harness.createSandbox();
	const config = { ...loadConfig(), ...sandbox.config };
	try {
		const legacyOverview = await invoke(config, "projectOverview");
		assert.equal(typeof legacyOverview, "object");
		const overview = await invoke(config, "virtualOsProjectOverview");
		assert.equal(overview.ok, true);
		assert.equal(overview.view, "Projects");
		assert.ok(overview.project?.id || overview.project?.projectId);
		assert.equal(overview.mission, null);
		const work = await invoke(config, "projectWorkView");
		assert.deepEqual(work.items, []);
		const agents = await invoke(config, "projectAgentsView");
		assert.deepEqual(agents.items, []);
		const smart = await invoke(config, "projectSmartView", { view: "needs_verification" });
		assert.equal(smart.ok, true);
		assert.equal(smart.view, "needs_verification");
		const context = await invoke(config, "projectContextView", {
			includeGraph: false,
			mandatorySources: [{ id: "must:project-view", text: "Project navigation is additive." }]
		});
		assert.equal(context.compilerVersion, "context-compiler-v1");
		assert.equal(context.sources.some(item => item.id === "must:project-view"), true);
		const why = await invoke(config, "projectWhy", {
			includeGraph: false,
			sources: [{ id: "why:source", text: "Why this project view exists." }],
			query: "project view"
		});
		assert.equal(why.ok, true);
		assert.equal(why.results.some(item => item.id === "why:source"), true);
		console.log(JSON.stringify({ ok: true, suite: "project-navigation" }));
	} finally {
		Harness.cleanupSandbox(sandbox);
	}
}

main().catch(error => {
	console.error(error?.stack || error);
	process.exitCode = 1;
});
