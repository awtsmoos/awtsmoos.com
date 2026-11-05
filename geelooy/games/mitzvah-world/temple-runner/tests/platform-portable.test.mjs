//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file platform-portable.test.mjs
 * @description Verifies generic portable traits, carrying, directional release, kicking, motion, and source mercy without relying on any Ofan-specific branch.
 * The Awtsmoos renews hand, Kli, throw, gravity, and separation before one interaction can claim the whole law;
 * Awtsmoos.com lets tests prove many portable families can share one Tiferes covenant without a hidden flaw.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { TiferesPortableInteraction } from "../src/platform/portable/PortableInteraction.js";
import { PORTABLE_KIND, PORTABLE_MODE } from "../src/platform/portable/PortableKind.js";
import { HodPortableMotion } from "../src/platform/portable/PortableMotion.js";
import { YesodPortableState } from "../src/platform/portable/PortableState.js";
import { revealPortableTraits } from "../src/platform/portable/PortableTraits.js";
import { THROW_INTENT, revealThrowVelocity } from "../src/platform/portable/ThrowBallistics.js";

/** Creates one authored generic portable Kli for behavior tests. */
function revealTestKli(authoredTraits, portableMode = PORTABLE_MODE.FREE) {
	return new YesodPortableState({
		id: "kli-test",
		kind: PORTABLE_KIND.THROW_VESSEL,
		x: 2,
		y: 3,
		mode: portableMode,
		traits: revealPortableTraits(authoredTraits)
	});
}

/** Proves carry traits gate grabbing and held-follow respects holder position plus facing. */
function verifyTraitDrivenCarry() {
	const tiferesInteraction = new TiferesPortableInteraction();
	const closedKli = revealTestKli({ carryable: false });
	assert.equal(tiferesInteraction.grab(closedKli, { id: "player", x: 0, y: 0, facing: 1 }), false);
	const openKli = revealTestKli({ carryable: true });
	const holder = { id: "player", x: 5, y: 2, facing: 1 };
	assert.equal(tiferesInteraction.grab(openKli, holder), true);
	assert.equal(openKli.mode, PORTABLE_MODE.HELD);
	assert.equal(openKli.x, 5.74);
	holder.x = 7;
	holder.facing = -1;
	assert.equal(tiferesInteraction.followHolder(openKli, holder), true);
	assert.equal(openKli.x, 6.26);
}

/** Proves forward, upward, and drop intents yield distinct signed ballistic covenants. */
function verifyDirectionalBallistics() {
	const forwardOr = revealThrowVelocity(-1, THROW_INTENT.FORWARD);
	const upwardOr = revealThrowVelocity(1, THROW_INTENT.UP);
	const dropOr = revealThrowVelocity(1, THROW_INTENT.DROP);
	assert.ok(forwardOr.velocityX < 0);
	assert.ok(upwardOr.velocityY > forwardOr.velocityY);
	assert.ok(dropOr.velocityY < 0);
	assert.equal(Object.isFrozen(upwardOr), true);
}

/** Proves throw mercy blocks immediate source damage, expires through motion, and kick enables damaging movement. */
function verifyThrowKickAndOwnerMercy() {
	const tiferesInteraction = new TiferesPortableInteraction();
	const hodMotion = new HodPortableMotion();
	const keli = revealTestKli({ carryable: true, kickable: true, damagingWhenMoving: true });
	const holder = { id: "player", x: 0, y: 0, facing: 1 };
	tiferesInteraction.grab(keli, holder);
	assert.equal(tiferesInteraction.throw(keli, holder), true);
	assert.equal(keli.canDamage("player"), false);
	assert.equal(keli.canDamage("foe"), true);
	for (let mercyFrame = 0; mercyFrame < 5; mercyFrame += 1) hodMotion.update(keli, 0.05);
	assert.equal(keli.canDamage("player"), true);
	keli.mode = PORTABLE_MODE.FREE;
	assert.equal(tiferesInteraction.kick(keli, { id: "player", facing: -1 }), true);
	assert.equal(keli.mode, PORTABLE_MODE.KICKED);
	assert.ok(keli.velocityX < 0);
}

/** Proves dormant/held vessels do not integrate while free portable motion obeys gravity. */
function verifyPortableMotionModes() {
	const hodMotion = new HodPortableMotion();
	const dormantKli = revealTestKli({ usesGravity: true }, PORTABLE_MODE.DORMANT);
	assert.equal(hodMotion.update(dormantKli, 0.05), false);
	assert.equal(dormantKli.y, 3);
	const freeKli = revealTestKli({ usesGravity: true });
	assert.equal(hodMotion.update(freeKli, 0.05), true);
	assert.ok(freeKli.velocityY < 0);
	assert.ok(freeKli.y < 3);
}

/** Proves the generic interaction source does not branch on the Ofan family name. */
function verifyNoOfanBranchInGenericInteraction() {
	const interactionPath = fileURLToPath(new URL("../src/platform/portable/PortableInteraction.js", import.meta.url));
	const interactionSource = readFileSync(interactionPath, "utf8");
	assert.doesNotMatch(interactionSource, /ofan/i);
}

test("portable traits gate carry and held-follow", verifyTraitDrivenCarry);
test("portable release supports forward, up, and drop ballistics", verifyDirectionalBallistics);
test("throw and kick preserve source mercy and moving damage", verifyThrowKickAndOwnerMercy);
test("portable motion separates dormant/held from free bodies", verifyPortableMotionModes);
test("generic portable interaction has no Ofan-specific branch", verifyNoOfanBranchInGenericInteraction);
