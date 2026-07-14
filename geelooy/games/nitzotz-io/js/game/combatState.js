// B"H
// Boruch Hashem
// Blessed is He
import { radiusForMass } from './scoring.js';
import { pulseHitFeedback } from './combatFeedback.js';

/** Create one finite combat vessel for cooldown, impacts, armor, and recovery. */
export function createCombatState() {
	return {
		pulseSerial: 0,
		pulseCooldown: 0,
		impacts: 0,
		armorBreaks: 0,
		capturesSinceArmor: 0
	};
}

/** Activate one Chochmah pulse only when its visible cooldown is ready. */
export function activatePulse(world) {
	if (world.mode !== 'playing' || world.combat.pulseCooldown > 0) return false;
	world.input.pulse = 0.62;
	world.player.glow = 1.5;
	world.combat.pulseSerial += 1;
	world.combat.pulseCooldown = 3.2 * (world.talentEffects?.pulseCooldownScale || 1);
	world.events.push(['pulse']);
	return true;
}

/** Tick combat timers and apply one bounded pulse wave per serial. */
export function updateCombat(world, dt) {
	world.combat.pulseCooldown = Math.max(0, world.combat.pulseCooldown - dt);
	for (const hole of [world.player, ...world.rivals]) tickHole(hole, dt);
	if (world.input.pulse <= 0) return;
	for (const rival of world.rivals) applyPulseToRival(world, rival);
}

function applyPulseToRival(world, rival) {
	if (rival.respawn > 0 || rival.lastPulseSerial === world.combat.pulseSerial) return;
	const distance = Math.hypot(rival.x - world.player.x, rival.y - world.player.y);
	const reach = world.player.r * 5.2 * (world.talentEffects?.pulseForce || 1);
	if (distance > reach) return;
	rival.lastPulseSerial = world.combat.pulseSerial;
	if (rival.armor > 0) {
		rival.armor -= 1;
		world.combat.armorBreaks += 1;
	} else {
		rival.mass = Math.max(18, rival.mass * 0.96);
		rival.r = radiusForMass(rival.mass);
	}
	pushAway(world.player, rival, 520 * (world.talentEffects?.pulseForce || 1));
	rival.stun = Math.max(rival.stun, 0.45);
	world.combat.impacts += 1;
	world.telemetry.impacts += 1;
	pulseHitFeedback(world, rival);
}

function tickHole(hole, dt) {
	hole.hitCooldown = Math.max(0, (hole.hitCooldown || 0) - dt);
	hole.stun = Math.max(0, (hole.stun || 0) - dt);
}

function pushAway(source, target, force) {
	const dx = target.x - source.x;
	const dy = target.y - source.y;
	const length = Math.max(1, Math.hypot(dx, dy));
	target.vx += dx / length * force;
	target.vy += dy / length * force;
}
