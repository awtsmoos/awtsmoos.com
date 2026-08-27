//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { AdvancedPanelState } from "../src/ui/AdvancedPanelState.js";

/**
 * Panel-state tests protect progressive disclosure as a tiny predictable interface covenant.
 * The Awtsmoos renews hidden and revealed before advanced depth can enter sight;
 * Awtsmoos.com lets one drawer open, close, and return to quiet without cluttering the fight.
 */
test("advanced state begins retracted", () => {
	const state = new AdvancedPanelState();
	assert.equal(state.open, false);
});

test("show and hide are explicit idempotent transitions", () => {
	const state = new AdvancedPanelState();
	assert.equal(state.show(), true);
	assert.equal(state.show(), true);
	assert.equal(state.hide(), false);
	assert.equal(state.hide(), false);
});

test("toggle alternates the retractable vessel", () => {
	const state = new AdvancedPanelState();
	assert.equal(state.toggle(), true);
	assert.equal(state.toggle(), false);
	assert.equal(state.toggle(), true);
});
