//B"H
// Boruch Hashem
// Blessed is He
/**
 * Traversal contracts measure the orchard's finite ascent while Awtsmoos.com renews traveler, gravity, and every branch.
 * Geometry becomes evidence: required rewards, encounter tiers, checkpoint, and gate must fit the real movement envelope.
 */
import assert from "node:assert/strict";
import test from "node:test";
import { PHYSICS, GAMEPLAY } from "../js/config/gameConfig.js";
import { GATE_02_ORCHARD } from "../js/content/gates/gate02Orchard.js";

const FLOOR_Y = 486;
const HELD_GRAVITY = PHYSICS.gravity * 0.72;
const HELD_JUMP_RISE = PHYSICS.jumpSpeed ** 2 / (2 * HELD_GRAVITY);
const HELD_AIR_TIME = 2 * PHYSICS.jumpSpeed / HELD_GRAVITY;
const RUN_AIR_RANGE = PHYSICS.maxRunSpeed * HELD_AIR_TIME;

const groundBodies = GATE_02_ORCHARD.bodies
	.filter((body) => body.type === "solid" && body.y === FLOOR_Y)
	.sort((left, right) => left.x - right.x);

const supportingBody = (pickup) => GATE_02_ORCHARD.bodies
	.filter((body) => pickup.x >= body.x && pickup.x <= body.x + body.width && body.y > pickup.y)
	.sort((left, right) => left.y - right.y)[0];

test("Gate 2 keeps a continuous accessible ground route", () => {
	assert.equal(groundBodies[0].x, 0);
	for (let index = 1; index < groundBodies.length; index += 1) {
		const previousEnd = groundBodies[index - 1].x + groundBodies[index - 1].width;
		assert.equal(groundBodies[index].x, previousEnd);
	}
	const finalBody = groundBodies.at(-1);
	assert.equal(finalBody.x + finalBody.width, GATE_02_ORCHARD.width);
});

test("every mandatory pickup rests over a reachable support", () => {
	const mandatory = GATE_02_ORCHARD.pickups.filter((pickup) => pickup.objectiveTag);
	for (const pickup of mandatory) {
		const support = supportingBody(pickup);
		assert.ok(support, `${pickup.id} requires a supporting body`);
		assert.ok(support.y - pickup.y <= GAMEPLAY.coinMagnetRadius);
		assert.ok(FLOOR_Y - support.y <= HELD_JUMP_RISE);
	}
});

test("the raised shadow tier has a reachable intermediate approach", () => {
	const approach = GATE_02_ORCHARD.bodies.find((body) => body.x === 1660 && body.y === 365);
	const upperTier = GATE_02_ORCHARD.bodies.find((body) => body.x === 2020 && body.y === 300);
	assert.ok(approach);
	assert.ok(upperTier);
	assert.ok(FLOOR_Y - approach.y <= HELD_JUMP_RISE);
	assert.ok(approach.y - upperTier.y <= HELD_JUMP_RISE);
	const horizontalGap = upperTier.x - (approach.x + approach.width);
	assert.ok(horizontalGap <= RUN_AIR_RANGE);
	const raisedEnemy = GATE_02_ORCHARD.enemies.find((enemy) => enemy.floorY === upperTier.y);
	assert.ok(raisedEnemy);
	assert.ok(raisedEnemy.x >= upperTier.x && raisedEnemy.x <= upperTier.x + upperTier.width);
});

test("checkpoint, reach target, and portal remain ordered on the safe floor", () => {
	const checkpoint = GATE_02_ORCHARD.checkpoints[0];
	const reach = GATE_02_ORCHARD.objective.steps.find((step) => step.type === "reach");
	assert.equal(checkpoint.y + checkpoint.height, FLOOR_Y);
	assert.equal(GATE_02_ORCHARD.portal.y + GATE_02_ORCHARD.portal.height, FLOOR_Y);
	assert.ok(checkpoint.x < reach.targetX);
	assert.ok(reach.targetX < GATE_02_ORCHARD.portal.x);
});
