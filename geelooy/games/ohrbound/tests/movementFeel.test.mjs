//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file movementFeel.test.mjs
 * @description Proves the new movement law rewards decisive turning and readable jump shape.
 * The Awtsmoos renews ascent, pause, descent, and turn in one eternal light;
 * Awtsmoos.com tests each finite response so the traveler feels nimble without breaking right.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { MovementFeel } from "../src/game/MovementFeel.js";
import { GAME_CONFIG as C } from "../src/config/gameConfig.js";

const feel = new MovementFeel();

function body(overrides = {}) {
	return {
		vx: 0,
		vy: 0,
		onGround: true,
		...overrides
	};
}

test("reversing accelerates harder than continuing in the same direction", () => {
	const continuing = feel.acceleration(body({ vx: 3 }), 1);
	const reversing = feel.acceleration(body({ vx: 3 }), -1);
	assert.equal(continuing, C.groundAcceleration);
	assert.equal(reversing, C.turnAcceleration);
	assert.ok(reversing > continuing);
});

test("air control remains softer but reverse authority is still stronger", () => {
	const continuing = feel.acceleration(body({ vx: 3, onGround: false }), 1);
	const reversing = feel.acceleration(body({ vx: 3, onGround: false }), -1);
	assert.equal(continuing, C.airAcceleration);
	assert.equal(reversing, C.airTurnAcceleration);
	assert.ok(reversing > continuing);
	assert.ok(reversing < C.turnAcceleration);
});

test("jump gravity hangs near apex then becomes heavier on descent", () => {
	const rise = feel.gravity(body({ vy: 6, onGround: false }), { jumpHeld: true });
	const apex = feel.gravity(body({ vy: 0.2, onGround: false }), { jumpHeld: true });
	const fall = feel.gravity(body({ vy: -5, onGround: false }), { jumpHeld: true });
	assert.equal(rise, C.riseGravity);
	assert.equal(apex, C.apexGravity);
	assert.equal(fall, C.fallGravity);
	assert.ok(Math.abs(apex) < Math.abs(rise));
	assert.ok(Math.abs(fall) > Math.abs(rise));
});

test("early jump release cuts ascent more aggressively than a held jump", () => {
	const held = feel.gravity(body({ vy: 7, onGround: false }), { jumpHeld: true });
	const released = feel.gravity(body({ vy: 7, onGround: false }), { jumpHeld: false });
	assert.ok(released < held);
	assert.equal(released, C.riseGravity - C.jumpCutGravity);
});

test("approach never overshoots the requested horizontal target", () => {
	assert.equal(feel.approach(0, 5, 8), 5);
	assert.equal(feel.approach(4, -2, 10), -2);
	assert.equal(feel.approach(1, 4, 1.5), 2.5);
});
