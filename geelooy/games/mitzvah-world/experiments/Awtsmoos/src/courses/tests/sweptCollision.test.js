// B"H
// Tests real anti-tunneling: substepped swept movers push instead of pierce,
// standing players ride, static walls block, and step-up is limited.

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	applyCarry,
	isStandingOnBox,
	PLAYER_RADIUS,
	pushOutOfBox,
	resolveSweptMover,
	STEP_UP_LIMIT
} from '../sweptCollision.js';

function box(cx, cz, w, d, top, thickness = 1) {
	return {
		minX: cx - w / 2, maxX: cx + w / 2,
		minY: top - thickness, maxY: top,
		minZ: cz - d / 2, maxZ: cz + d / 2
	};
}

test('isStandingOnBox detects feet on the box top', () => {
	const platform = box(0, 0, 4, 4, 2);
	assert.equal(isStandingOnBox({ x: 0, y: 2, z: 0 }, platform), true);
	assert.equal(isStandingOnBox({ x: 0, y: 0, z: 0 }, platform), false);
	assert.equal(isStandingOnBox({ x: 10, y: 2, z: 0 }, platform), false);
});

test('pushOutOfBox blocks walking into a tall wall', () => {
	const wall = box(0, 0, 2, 2, 3, 4); // extends from y=-1 to y=3
	const player = { x: -0.5, y: 0, z: 0 }; // overlapping the wall's west face
	assert.equal(pushOutOfBox(player, wall), true);
	assert.ok(player.x <= -1 - PLAYER_RADIUS + 1e-9, `x=${player.x}`);
});

test('pushOutOfBox allows stepping onto a low ledge', () => {
	const ledge = box(0, 0, 2, 2, 0.4); // top within step-up of feet at 0
	const player = { x: 0.5, y: 0, z: 0 };
	assert.equal(pushOutOfBox(player, ledge), false);
});

test('fast mover cannot tunnel through the player — it pushes', () => {
	// A 4m-wide mover jumps 6m in one frame straight through the player.
	const prev = box(-5, 0, 4, 4, 1);
	const now = box(1, 0, 4, 4, 1);
	const player = { x: 0, y: 0, z: 0 };
	const receipt = resolveSweptMover(player, prev, now);
	assert.equal(receipt.pushed, true);
	assert.ok(receipt.substeps > 1, `substeps=${receipt.substeps}`);
	// Player must be fully outside the mover's final box.
	const px = player.x;
	assert.ok(px + PLAYER_RADIUS <= now.minX + 1e-9 || px - PLAYER_RADIUS >= now.maxX - 1e-9,
		`player x=${px} still inside mover`);
});

test('slow mover overlapping a standing player does not push (carry handles it)', () => {
	const prev = box(0, 0, 4, 4, 1);
	const now = box(0.1, 0, 4, 4, 1);
	const player = { x: 0, y: 1, z: 0 }; // standing on top
	const receipt = resolveSweptMover(player, prev, now);
	assert.equal(receipt.pushed, false);
	assert.equal(player.x, 0);
});

test('applyCarry rides the standing player with the mover delta', () => {
	const prev = box(0, 0, 4, 4, 1);
	const now = box(2, 0, 4, 4, 1);
	const player = { x: 0.5, y: 1, z: -0.5 };
	assert.equal(applyCarry(player, prev, now), true);
	assert.ok(Math.abs(player.x - 2.5) < 1e-9, `x=${player.x}`);
	assert.ok(Math.abs(player.z - (-0.5)) < 1e-9);
});

test('applyCarry ignores players who are not on the mover', () => {
	const prev = box(0, 0, 4, 4, 1);
	const now = box(2, 0, 4, 4, 1);
	const player = { x: 20, y: 0, z: 0 };
	assert.equal(applyCarry(player, prev, now), false);
	assert.equal(player.x, 20);
});

test('step-up limit constant matches the design contract', () => {
	assert.equal(STEP_UP_LIMIT, 0.55);
});
