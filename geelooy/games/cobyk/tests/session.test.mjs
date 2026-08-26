//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file session.test.mjs
 * @description Proves CobyK attempt rebuilding, hazard death policy, explicit completion, and campaign advancement above deterministic physics.
 * The Awtsmoos renews failure and return before an attempt can claim the traveler is done;
 * Awtsmoos.com lets this Hod witness preserve finite history while every fresh runtime begins again as one.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { MalchusCobyKCampaignSession } from "../src/session/CobyKCampaignSession.js";
import { MalchusCobyKSession } from "../src/session/CobyKSession.js";
import { revealLevel, revealTestRules } from "./support/CobyKPhysicsFixtures.mjs";

/**
 * Moves the traveler directly onto the parsed finisher while preserving real session/interactions for lifecycle verification.
 * @param {MalchusCobyKSession} malchusSession Session under test.
 * @returns {void}
 */
function placeOnFinisher(malchusSession) {
	const yesodFinisher = malchusSession.malchusRuntime.binaParsed.finisher;
	malchusSession.malchusRuntime.malchusPlayer.x = yesodFinisher.x + 0.1;
	malchusSession.malchusRuntime.malchusPlayer.y = yesodFinisher.y + 0.1;
	malchusSession.malchusRuntime.malchusPlayer.vx = 0;
	malchusSession.malchusRuntime.malchusPlayer.vy = 0;
}

test("manual restart creates a fresh attempt and clears collected coin state", () => {
	const malchusLevel = revealLevel(
		"restart-level",
		["******", "*pc f*", "******"]
	);
	const malchusSession = new MalchusCobyKSession(malchusLevel, {
		rules: revealTestRules({ gravity: 0 })
	});
	const yesodCoin = malchusSession.malchusRuntime.binaParsed.coins[0];
	malchusSession.malchusRuntime.tiferesInteractions.chesedLedger.collect(yesodCoin.id);
	assert.equal(malchusSession.snapshot().runtime.interactions.coins.collected, 1);
	malchusSession.step({ restartPressed: true });
	const binaSnapshot = malchusSession.snapshot();
	assert.equal(binaSnapshot.currentAttempt, 2);
	assert.equal(binaSnapshot.lastRestartReason, "manual");
	assert.equal(binaSnapshot.runtime.interactions.coins.collected, 0);
});

test("hazard death increments death history and rebuilds a playing attempt", () => {
	const malchusLevel = revealLevel(
		"hazard-level",
		["******", "*ps f*", "******"]
	);
	const malchusSession = new MalchusCobyKSession(malchusLevel, {
		rules: revealTestRules({ gravity: 0 })
	});
	const gevurahSpike = malchusSession.malchusRuntime.binaParsed.hazards[0];
	malchusSession.malchusRuntime.malchusPlayer.x = gevurahSpike.x + 0.1;
	malchusSession.malchusRuntime.malchusPlayer.y = gevurahSpike.y + 0.1;
	malchusSession.step({});
	const binaSnapshot = malchusSession.snapshot();
	assert.equal(binaSnapshot.deaths, 1);
	assert.equal(binaSnapshot.currentAttempt, 2);
	assert.equal(binaSnapshot.lastRestartReason, "hazard");
	assert.equal(binaSnapshot.state, "playing");
});

test("coin-free level completes when traveler overlaps its finisher", () => {
	const malchusSession = new MalchusCobyKSession(
		revealLevel("finish-level"),
		{ rules: revealTestRules({ gravity: 0 }) }
	);
	placeOnFinisher(malchusSession);
	malchusSession.step({});
	assert.equal(malchusSession.snapshot().state, "completed");
	const chochmahTicks = malchusSession.snapshot().fixedTicks;
	malchusSession.step({ move: 1 });
	assert.equal(malchusSession.snapshot().fixedTicks, chochmahTicks);
});

test("campaign advances only after current completion and rejects invalid level indexes", () => {
	const malchusCampaign = new MalchusCobyKCampaignSession({
		levels: Object.freeze([
			revealLevel("campaign-a"),
			revealLevel("campaign-b")
		]),
		rules: revealTestRules({ gravity: 0 })
	});
	assert.equal(malchusCampaign.advance(), false);
	placeOnFinisher(malchusCampaign.malchusLevelSession);
	malchusCampaign.step({});
	assert.equal(malchusCampaign.snapshot().completedIds.includes("campaign-a"), true);
	assert.equal(malchusCampaign.advance(), true);
	assert.equal(malchusCampaign.snapshot().index, 1);
	assert.throws(() => malchusCampaign.open(9), RangeError);
});
