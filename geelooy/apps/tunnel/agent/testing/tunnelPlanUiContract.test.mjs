//B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import fs from "node:fs";
import { PAGE_META, PAGE_ORDER } from "../../../tunnel-control/js/shell/pageSpecs.js";

/**
 * @file Locks Tunnel Control discovery and steering contracts for the Tunnel-native Plan Registry.
 * @description The Awtsmoos reveals one live plan through API and browser projection; this test
 * prevents the pane, controls, or authenticated action wiring from silently disappearing.
 */
function main() {
	assert.equal(PAGE_META.plans?.key, "plans");
	assert.equal(PAGE_META.plans?.title, "Plans");
	assert.ok(PAGE_ORDER.indexOf("plans") > PAGE_ORDER.indexOf("missionRooms"));
	assert.ok(PAGE_ORDER.indexOf("plans") < PAGE_ORDER.indexOf("subAgents"));
	const root = new URL("../../../tunnel-control/js/", import.meta.url);
	const feature = read(root, "features/plans.js");
	const controller = read(root, "features/plans/controller.js");
	const view = read(root, "features/plans/view.js");
	const api = read(root, "features/plans/api.js");
	assert.match(feature, /mountPlans/);
	assert.match(controller, /tunnelPlanChecklistSet|setChecklist/);
	assert.match(controller, /addPrompt/);
	assert.match(view, /planChecklistControls/);
	assert.match(view, /planPromptInput/);
	assert.match(api, /tunnelPlanList/);
	assert.match(api, /tunnelPlanHtml/);
	console.log(JSON.stringify({ ok: true, suite: "tunnel-plan-ui-contract" }));
}

function read(root, relative) {
	return fs.readFileSync(new URL(relative, root), "utf8");
}

main();
