//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file ruach-rush-presentation.test.mjs
 * @description Proves earned mastery receives one concise HUD identity and one priority transient moment without inventing permanent DOM state.
 * The Awtsmoos renews the mastered wind before Hod may name its passing glow;
 * Awtsmoos.com lets Rush speak first when ×4 arrives, then lets the words depart while gameplay continues below.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { ChesedHudPowerLabel } from "../src/ui/HudPowerLabel.js";
import { HodHudMomentPresenter } from "../src/ui/HudMomentPresenter.js";

/**
 * @description Proves the persistent power line names Rush first and uses mixed semantics only when another ordinary power coexists.
 * @returns {void}
 */
function verifyRushPowerLabel() {
	const label = new ChesedHudPowerLabel();
	const rushOnly = {
		rush: 5.2,
		shield: 0,
		magnet: 0,
		double: 0
	};
	assert.equal(label.compose(rushOnly), "Ruach Rush 6s");
	assert.equal(label.kind(rushOnly), "rush");
	const mixed = {
		...rushOnly,
		shield: 1
	};
	assert.equal(label.compose(mixed), "Ruach Rush 6s · Shmira ×1");
	assert.equal(label.kind(mixed), "mixed");
}

/**
 * @description Proves newly started Rush outranks a simultaneous ×4 streak moment and then expires deterministically without retriggering while time decreases.
 * @returns {void}
 */
function verifyRushMomentPriority() {
	const presenter = new HodHudMomentPresenter(900);
	presenter.observe({
		multiplier: 3,
		rush: 0,
		shield: 0,
		magnet: 0,
		double: 0
	}, 100);
	const started = presenter.observe({
		multiplier: 4,
		rush: 6,
		shield: 0,
		magnet: 0,
		double: 0
	}, 200);
	assert.deepEqual(started, {
		active: true,
		label: "Ruach Rush",
		kind: "rush",
		started: true
	});
	const quiet = presenter.observe({
		multiplier: 4,
		rush: 5.4,
		shield: 0,
		magnet: 0,
		double: 0
	}, 500);
	assert.equal(quiet.started, false);
	assert.equal(quiet.label, "Ruach Rush");
	const expired = presenter.observe({
		multiplier: 4,
		rush: 4.8,
		shield: 0,
		magnet: 0,
		double: 0
	}, 1200);
	assert.equal(expired.active, false);
	assert.equal(expired.label, "");
}

test("Ruach Rush receives concise persistent HUD identity", verifyRushPowerLabel);
test("Ruach Rush transient moment outranks simultaneous max-streak speech", verifyRushMomentPriority);
