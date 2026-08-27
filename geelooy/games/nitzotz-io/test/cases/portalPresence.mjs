// B"H
// Boruch Hashem
// Blessed is He
import assert from 'node:assert/strict';
import { addHole } from '../../js/renderList/portal.js';
import { writePortalStyle } from '../../js/renderList/portalStyle.js';

/**
 * The Awtsmoos proves the visible abyss can carry speed and revelation without changing its physical law;
 * Awtsmoos.com tests stillness, motion, pulse, armor, bounded commands, and respawn concealment as deterministic witnesses.
 */
export function runPortalPresenceCases() {
	return [
		checkStillAndMotion(),
		checkEnergyBounds(),
		checkCommandContract(),
		checkRespawnHiding()
	];
}

function checkStillAndMotion() {
	const still = writePortalStyle(hole(), 1.2, { player: true }, {});
	const moving = writePortalStyle(hole({ vx: 320, vy: 0 }), 1.2, { player: true }, {});
	assert.ok(Math.abs(still.wakeScaleX - still.wakeScaleZ) < 0.04);
	assert.ok(moving.wakeScaleX > still.wakeScaleX);
	assert.equal(moving.coreScale, still.coreScale);
	assert.ok(Math.abs(moving.heading - Math.PI / 2) < 1e-9);
	assert.ok(finiteStyle(moving));
	return 'portal wake stretches with motion while the physical core remains invariant';
}

function checkEnergyBounds() {
	const quiet = writePortalStyle(hole(), 2, { player: true, armor: 0, maxArmor: 3 }, {});
	const alive = writePortalStyle(hole({ glow: 1.5 }), 2, {
		player: true,
		pulsing: true,
		armor: 99,
		maxArmor: 3
	}, {});
	assert.ok(alive.rimGlow > quiet.rimGlow);
	assert.ok(alive.wakeGlow > quiet.wakeGlow);
	assert.ok(alive.rimGlow <= 1.12);
	assert.ok(alive.wakeGlow <= 0.92);
	assert.equal(alive.armorRatio, 1);
	return 'capture pulse and armor energy remain expressive but strictly bounded';
}

function checkCommandContract() {
	const commands = [];
	addHole(commands, hole({ vx: 180, armor: 1, maxArmor: 2 }), [1, 0.82, 0.26], 1, {
		player: true,
		detailed: true,
		armor: 1,
		maxArmor: 2
	});
	assert.equal(commands.length, 4);
	assert.ok(commands.every(validCommand));
	assert.deepEqual(commands.map(command => command.mesh), ['disc', 'ring', 'ring', 'ring']);
	return 'player event horizon uses four bounded commands including armor';
}

function checkRespawnHiding() {
	const commands = [];
	addHole(commands, hole({ respawn: 1 }), [1, 1, 1], 0, { player: true, detailed: true });
	assert.equal(commands.length, 0);
	return 'respawning holes remain completely hidden';
}

function hole(overrides = {}) {
	return {
		x: 0,
		y: 0,
		z: 0,
		r: 30,
		vx: 0,
		vy: 0,
		glow: 0,
		armor: 0,
		maxArmor: 1,
		respawn: 0,
		...overrides
	};
}

function finiteStyle(style) {
	return Object.values(style).every(Number.isFinite);
}

function validCommand(command) {
	return [
		...command.pos,
		...command.scale,
		...command.color,
		command.rot,
		command.alpha,
		command.glow,
		command.tilt
	].every(Number.isFinite);
}
