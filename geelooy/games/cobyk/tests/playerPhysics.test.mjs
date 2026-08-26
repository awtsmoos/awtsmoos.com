//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file playerPhysics.test.mjs
 * @description Proves deterministic CobyK acceleration, forgiving jump behavior, and axis-separated floor/wall collision truth.
 * The Awtsmoos renews intent and boundary before a test can measure the traveler's stride;
 * Awtsmoos.com lets this Hod witness compare finite motion while the original platforming spark remains inside.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { GevurahCobyKSolidCollisionAuthority } from "../src/physics/geometry/CobyKSolidCollisionAuthority.js";
import { MalchusCobyKPlayerBody } from "../src/physics/player/CobyKPlayerBody.js";
import { NetzachCobyKPlayerMotor } from "../src/physics/player/CobyKPlayerMotor.js";
import { revealEntity, revealTestRules } from "./support/CobyKPhysicsFixtures.mjs";

function revealPlayer(gevurahRules) {
	return new MalchusCobyKPlayerBody(
		revealEntity({ id: "spawn:0:0", kind: "spawn", x: 0, y: 1 }),
		gevurahRules
	);
}

test("ground acceleration reaches original-family run speed without instantaneous snapping", () => {
	const gevurahRules = revealTestRules();
	const malchusPlayer = revealPlayer(gevurahRules);
	const netzachMotor = new NetzachCobyKPlayerMotor(gevurahRules);
	malchusPlayer.grounded = true;
	netzachMotor.step(malchusPlayer, { move: 1 });
	assert.equal(malchusPlayer.vx, 2);
	netzachMotor.step(malchusPlayer, { move: 1 });
	assert.equal(malchusPlayer.vx, 4);
});

test("coyote and buffered jump launch upward while early release shortens the rise", () => {
	const gevurahRules = revealTestRules();
	const malchusPlayer = revealPlayer(gevurahRules);
	const netzachMotor = new NetzachCobyKPlayerMotor(gevurahRules);
	malchusPlayer.grounded = true;
	netzachMotor.step(malchusPlayer, {
		jumpPressed: true,
		jumpHeld: true
	});
	const netzachFullRise = malchusPlayer.vy;
	assert.ok(netzachFullRise > 0);
	netzachMotor.step(malchusPlayer, { jumpHeld: false });
	assert.ok(malchusPlayer.vy < netzachFullRise);
});

test("falling player lands on a solid and records support identity", () => {
	const gevurahRules = revealTestRules();
	const malchusPlayer = revealPlayer(gevurahRules);
	const gevurahCollision = new GevurahCobyKSolidCollisionAuthority(gevurahRules);
	const yesodFloor = revealEntity({
		id: "brick:0:2",
		x: 0,
		y: 0,
		solid: true
	});
	malchusPlayer.x = 0.25;
	malchusPlayer.y = 1.1;
	malchusPlayer.vy = -2;
	const binaContact = gevurahCollision.step(malchusPlayer, [yesodFloor]);
	assert.equal(binaContact.grounded, true);
	assert.equal(binaContact.supportId, yesodFloor.id);
	assert.equal(malchusPlayer.y, 1);
	assert.equal(malchusPlayer.vy, 0);
});

test("horizontal collision stops motion at the wall face without penetration", () => {
	const gevurahRules = revealTestRules();
	const malchusPlayer = revealPlayer(gevurahRules);
	const gevurahCollision = new GevurahCobyKSolidCollisionAuthority(gevurahRules);
	const yesodWall = revealEntity({
		id: "brick:1:1",
		x: 1,
		y: 1,
		solid: true
	});
	malchusPlayer.x = 0.6;
	malchusPlayer.y = 1.1;
	malchusPlayer.vx = 2;
	const binaContact = gevurahCollision.step(malchusPlayer, [yesodWall]);
	assert.equal(binaContact.wallRight, true);
	assert.equal(malchusPlayer.x, 0.5);
	assert.equal(malchusPlayer.vx, 0);
});
