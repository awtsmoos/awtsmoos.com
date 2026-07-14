// B"H
// Boruch Hashem
// Blessed is He
import assert from 'node:assert/strict';
import {
	activatePulse,
	blockConsumeWithArmor,
	recordCaptureForArmor,
	resolveImpact,
	updateCombat
} from '../../js/game/combat.js';
import { createWorld } from '../../js/state.js';

/**
 * The Awtsmoos verifies finite cooldown, one pulse hit per serial, armor sacrifice,
 * bounded collision impact, and Chesed recovery without projectile simulation.
 */
export function runCombatExpansionCases() {
	return [
		checkPulseCooldown(),
		checkPulseSerialBound(),
		checkArmorConsumeBlock(),
		checkCollisionImpact(),
		checkArmorRecovery()
	];
}

function checkPulseCooldown() {
	const world = playingWorld();
	assert.equal(activatePulse(world), true);
	const cooldown = world.combat.pulseCooldown;
	assert.ok(cooldown > 0);
	assert.equal(activatePulse(world), false);
	updateCombat(world, cooldown + 0.1);
	assert.equal(world.combat.pulseCooldown, 0);
	assert.equal(activatePulse(world), true);
	return { test: 'combat-pulse-cooldown', cooldown };
}

function checkPulseSerialBound() {
	const world = playingWorld();
	const rival = world.rivals[0];
	placeForPulse(world, rival);
	activatePulse(world);
	updateCombat(world, 0.01);
	const impacts = world.combat.impacts;
	const velocity = Math.hypot(rival.vx, rival.vy);
	updateCombat(world, 0.01);
	assert.equal(world.combat.impacts, impacts);
	assert.ok(velocity > 0 && Number.isFinite(velocity));
	assert.equal(rival.lastPulseSerial, world.combat.pulseSerial);
	return { test: 'combat-pulse-serial-bound', impacts, velocity };
}

function checkArmorConsumeBlock() {
	const world = playingWorld();
	const larger = world.rivals[0];
	world.player.armor = 2;
	world.player.maxArmor = 2;
	larger.mass = world.player.mass * 4;
	const blocked = blockConsumeWithArmor(world, larger, world.player);
	assert.equal(blocked, true);
	assert.equal(world.player.armor, 1);
	assert.ok(world.player.grace >= 1);
	assert.equal(world.combat.armorBreaks, 1);
	return { test: 'combat-armor-consume-block', armor: world.player.armor };
}

function checkCollisionImpact() {
	const world = playingWorld();
	const rival = world.rivals[0];
	world.player.mass = rival.mass;
	world.player.vx = 220;
	rival.vx = -220;
	world.player.x = 0;
	world.player.y = 0;
	rival.x = 1;
	rival.y = 0;
	const before = world.player.mass;
	assert.equal(resolveImpact(world, world.player, rival), true);
	assert.ok(world.player.mass < before || rival.mass < before);
	assert.equal(world.telemetry.impacts, 1);
	assert.ok(world.player.hitCooldown > 0 && rival.hitCooldown > 0);
	return { test: 'combat-collision-impact', impacts: world.telemetry.impacts };
}

function checkArmorRecovery() {
	const world = playingWorld();
	world.player.maxArmor = 3;
	world.player.armor = 1;
	world.talentEffects = { ...world.talentEffects, armorRecoveryCaptures: 4 };
	for (let index = 0; index < 3; index += 1) recordCaptureForArmor(world);
	assert.equal(world.player.armor, 1);
	recordCaptureForArmor(world);
	assert.equal(world.player.armor, 2);
	assert.equal(world.combat.capturesSinceArmor, 0);
	return { test: 'combat-armor-recovery', armor: world.player.armor };
}

function playingWorld() {
	const world = createWorld();
	world.mode = 'playing';
	world.events.length = 0;
	return world;
}

function placeForPulse(world, rival) {
	world.player.x = 0;
	world.player.y = 0;
	rival.x = world.player.r * 2;
	rival.y = 0;
	rival.vx = 0;
	rival.vy = 0;
}
