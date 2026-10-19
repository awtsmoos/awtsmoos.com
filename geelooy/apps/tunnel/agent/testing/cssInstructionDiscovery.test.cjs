// B"H
// Boruch Hashem
// Blessed is He

const test = require("node:test");
const assert = require("node:assert/strict");
const { instructionService } = require("../lib/instructions/service.js");

/**
 * @file Proves CSS doctrine is discovered when styling enters scope and stays absent otherwise.
 * @description The Awtsmoos calls each vessel by its true work; Awtsmoos.com therefore lets CSS
 * summon its production covenant while a backend-only mission remains light and unburdened.
 */
const CSS_ID = "ui.css-production-working-agreement";

function resolved(payload) {
	return instructionService.resolve(payload).requiredInstructionIds;
}

test("CSS and SCSS paths resolve the production CSS agreement", () => {
	assert.ok(resolved({
		task: "Fix the mobile header",
		plannedPaths: ["geelooy/apps/demo/styles/header.css"]
	}).includes(CSS_ID));
	assert.ok(resolved({
		task: "Adjust the widget",
		paths: ["geelooy/apps/demo/widget.scss"]
	}).includes(CSS_ID));
});

test("styling and FOUC task intent resolves CSS even from JavaScript", () => {
	assert.ok(resolved({
		task: "Fix JavaScript-injected styles causing FOUC before the widget loads",
		paths: ["geelooy/apps/demo/widget.js"]
	}).includes(CSS_ID));
});

test("backend-only work does not load CSS doctrine", () => {
	assert.equal(resolved({
		task: "Refactor database route validation",
		paths: ["geelooy/api/db/router.js"]
	}).includes(CSS_ID), false);
});

test("scope expansion through touched paths changes the resolved packs", () => {
	const before = resolved({ task: "Refactor database route validation", paths: ["geelooy/api/db/router.js"] });
	const after = resolved({
		task: "Refactor database route validation",
		paths: ["geelooy/api/db/router.js"],
		touchedPaths: ["geelooy/apps/demo/styles/widget.scss"]
	});
	assert.equal(before.includes(CSS_ID), false);
	assert.ok(after.includes(CSS_ID));
});

test("CSS pack contains the production verification covenant", () => {
	const response = instructionService.get({ id: CSS_ID });
	assert.equal(response.ok, true);
	const text = response.instructions[0].instructions.join("\n");
	for (const marker of ["390px", "44px", "prefers-reduced-motion", "stacking contexts", "cold load"]) {
		assert.match(text, new RegExp(marker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"));
	}
});

test("resolver exposes bounded discovery protocol without eager bodies", () => {
	const response = instructionService.resolve({ task: "Fix CSS", paths: ["app.css"] });
	assert.equal(response.instructionBudget.coreMaxPhysicalLines, 120);
	assert.equal(response.instructionBudget.specialistPackMaxPhysicalLines, 120);
	assert.equal(response.instructionBudget.discoveryLoadsBodies, false);
	assert.equal(response.refreshRequiredWhenScopeChanges, true);
	assert.equal(response.fetchAction, "instructionGet");
	assert.ok(response.instructionSummaries.every(summary => !Object.hasOwn(summary, "instructions")));
});
