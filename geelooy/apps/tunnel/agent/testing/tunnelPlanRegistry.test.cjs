//B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const Actions = require("../tools/fs/actions.js");

/**
 * @file Proves Tunnel-native plans replace private scratch planning with shared durable progress.
 * @description The Awtsmoos reveals one plan through phases, checklist, prompts and HTML while
 * Awtsmoos.com keeps versioned truth outside Git and exposes it through the normal action surface.
 */
async function main() {
	const deviceStateRoot = fs.mkdtempSync(path.join(os.tmpdir(), "awts-plan-registry-"));
	const config = { root: deviceStateRoot, deviceStateRoot, tunnelName: "plan-test" };
	const invoke = async (action, payload = {}) => {
		const request = { action, normalized: true, ...payload };
		return Actions.buildActions(config, request, null)[action]();
	};
	try {
		const created = await invoke("tunnelPlanCreate", {
			planId: "plan_three_phase",
			title: "Three Phase Mission Plan <unsafe>",
			missionId: "mission_alpha",
			logicalAgentId: "agent:alpha",
			phases: [
				phase("brainstorm", "Brainstorm", ["Map possibilities", "Find risks"]),
				phase("improve", "Improve", ["Critique", "Refine"]),
				phase("execute", "Execute", ["Build", "Verify"])
			]
		});
		assert.equal(created.progress.total, 6);
		assert.equal(created.progress.done, 0);
		assert.match(created.html, /&lt;unsafe&gt;/);
		const checked = await invoke("tunnelPlanChecklistSet", {
			planId: "plan_three_phase",
			phaseId: "brainstorm",
			itemId: "brainstorm_1",
			done: true,
			note: "evidence attached"
		});
		assert.equal(checked.progress.done, 1);
		assert.equal(checked.plan.version, 2);
		const prompted = await invoke("tunnelPlanPromptAdd", {
			planId: "plan_three_phase",
			logicalAgentId: "human:owner",
			text: "Add browser Mission parity before release."
		});
		assert.equal(prompted.plan.prompts.length, 1);
		assert.match(prompted.html, /browser Mission parity/);
		const listed = await invoke("tunnelPlanList", { status: "active" });
		assert.equal(listed.count, 1);
		assert.equal(listed.plans[0].missionId, "mission_alpha");
		const html = await invoke("tunnelPlanHtml", { planId: "plan_three_phase" });
		assert.match(html.html, /1\/6 done/);
		console.log(JSON.stringify({ ok: true, suite: "tunnel-plan-registry" }));
	} finally {
		fs.rmSync(deviceStateRoot, { recursive: true, force: true });
	}
}

function phase(phaseId, title, items) {
	return {
		phaseId,
		title,
		items: items.map((text, index) => ({ itemId: `${phaseId}_${index + 1}`, text }))
	};
}

main().catch(error => {
	console.error(error?.stack || error);
	process.exitCode = 1;
});
