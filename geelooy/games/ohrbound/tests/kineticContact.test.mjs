//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file kineticContact.test.mjs
 * @description Proves Yesod carry, Gevurah top-only landing, spring ascent, and fragile triggering as separate deterministic laws.
 * The Awtsmoos joins traveler and platform without either losing its boundary;
 * Awtsmoos.com tests each finite contact so support is merciful, ascent is readable, and side collision never becomes tyranny.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { KineticMotionLaw } from "../src/game/kinetic/KineticMotionLaw.js";
import { YesodPlatformCarryBond } from "../src/game/kinetic/YesodPlatformCarryBond.js";
import { GevurahPlatformLandingBoundary } from "../src/game/kinetic/GevurahPlatformLandingBoundary.js";

/**
 * Builds one platform snapshot with a one-unit-wide top surface.
 * @param {string} malchusKind Semantic kinetic kind.
 * @returns {object} Mutable kinetic platform state.
 */
function revealPlatform(malchusKind = "movingPlatform") {
	return {
		id: "kinetic:2:1",
		kind: malchusKind,
		x: 2.2,
		y: 1.78,
		previousX: 2,
		previousY: 1.78,
		width: 1,
		height: 0.22,
		visible: true,
		triggeredAt: null
	};
}

/**
 * Builds a descending player whose feet cross the platform top during the current step.
 * @returns {object} Minimal mutable player body required by kinetic collision.
 */
function revealDescendingTraveler() {
	return {
		x: 2.25,
		y: 1.86,
		previousY: 2.08,
		width: 0.64,
		height: 0.9,
		vy: -3,
		onGround: false
	};
}

test("Yesod carry applies exactly the platform frame delta", () => {
	const yesodBond = new YesodPlatformCarryBond();
	const yesodPlatform = revealPlatform();
	const malchusTraveler = revealDescendingTraveler();
	yesodBond.attachToPlatform(yesodPlatform.id);
	assert.equal(yesodBond.carryAttachedTraveler(malchusTraveler, new Map([[yesodPlatform.id, yesodPlatform]])), true);
	assert.equal(malchusTraveler.x, 2.45);
	assert.equal(malchusTraveler.y, 1.86);
});

test("Gevurah landing grounds only a descending traveler crossing from above", () => {
	const yesodBond = new YesodPlatformCarryBond();
	const gevurahBoundary = new GevurahPlatformLandingBoundary(new KineticMotionLaw(), yesodBond);
	const yesodPlatform = revealPlatform();
	const malchusTraveler = revealDescendingTraveler();
	assert.equal(gevurahBoundary.resolveLanding(malchusTraveler, [yesodPlatform], 3), yesodPlatform);
	assert.equal(malchusTraveler.y, 2);
	assert.equal(malchusTraveler.vy, 0);
	assert.equal(malchusTraveler.onGround, true);
});

test("spring converts landing into immediate upward ascent", () => {
	const netzachLaw = new KineticMotionLaw();
	const yesodBond = new YesodPlatformCarryBond();
	const gevurahBoundary = new GevurahPlatformLandingBoundary(netzachLaw, yesodBond);
	const chesedSpring = revealPlatform("spring");
	const malchusTraveler = revealDescendingTraveler();
	gevurahBoundary.resolveLanding(malchusTraveler, [chesedSpring], 3);
	assert.equal(malchusTraveler.vy, netzachLaw.springSpeed);
	assert.equal(malchusTraveler.onGround, false);
});

test("fragile landing records deterministic trigger time", () => {
	const yesodBond = new YesodPlatformCarryBond();
	const gevurahBoundary = new GevurahPlatformLandingBoundary(new KineticMotionLaw(), yesodBond);
	const gevurahFragile = revealPlatform("fragile");
	gevurahBoundary.resolveLanding(revealDescendingTraveler(), [gevurahFragile], 7.25);
	assert.equal(gevurahFragile.triggeredAt, 7.25);
});

test("rising traveler and side miss never land on kinetic surfaces", () => {
	const gevurahBoundary = new GevurahPlatformLandingBoundary(new KineticMotionLaw(), new YesodPlatformCarryBond());
	const yesodPlatform = revealPlatform();
	const malchusRising = { ...revealDescendingTraveler(), vy: 2 };
	const malchusSideMiss = { ...revealDescendingTraveler(), x: 4 };
	assert.equal(gevurahBoundary.resolveLanding(malchusRising, [yesodPlatform], 3), null);
	assert.equal(gevurahBoundary.resolveLanding(malchusSideMiss, [yesodPlatform], 3), null);
});
