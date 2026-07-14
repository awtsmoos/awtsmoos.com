// B"H
// Boruch Hashem
// Blessed is He
import { radiusForMass } from './scoring.js';
import {
	armorBreakFeedback,
	armorRestoreFeedback,
	impactFeedback
} from './combatFeedback.js';

const IMPACT_SPEED = 150;

/** Let one armor segment absorb an otherwise decisive consume. */
export function blockConsumeWithArmor(world, larger, smaller) {
	if ((smaller.armor || 0) <= 0 || smaller.hitCooldown > 0) return false;
	smaller.armor -= 1;
	smaller.hitCooldown = 0.9;
	smaller.grace = Math.max(smaller.grace || 0, 1.1);
	separateHoles(larger, smaller, 360);
	world.combat.armorBreaks += 1;
	if (smaller === world.player) armorBreakFeedback(world, smaller);
	return true;
}

/** Resolve a high-speed overlap when neither hole is large enough to consume. */
export function resolveImpact(world, first, second) {
	if (first.hitCooldown > 0 || second.hitCooldown > 0) return false;
	const relativeX = (first.vx || 0) - (second.vx || 0);
	const relativeY = (first.vy || 0) - (second.vy || 0);
	const speed = Math.hypot(relativeX, relativeY);
	if (speed < IMPACT_SPEED) return false;
	first.hitCooldown = 0.45;
	second.hitCooldown = 0.45;
	const target = first.mass <= second.mass ? first : second;
	const resistance = target === world.player ? world.talentEffects?.impactResistance || 0 : 0;
	target.mass = Math.max(18, target.mass * (1 - 0.025 * (1 - resistance)));
	target.r = radiusForMass(target.mass);
	if (target.armor > 0 && speed > 230) {
		target.armor -= 1;
		world.combat.armorBreaks += 1;
		if (target === world.player) armorBreakFeedback(world, target);
	}
	separateHoles(first, second, Math.min(520, speed * 1.1));
	world.combat.impacts += 1;
	world.telemetry.impacts += 1;
	if (first === world.player || second === world.player) impactFeedback(world, target);
	return true;
}

/** Count captures toward bounded Chesed armor renewal. */
export function recordCaptureForArmor(world) {
	if (world.player.armor >= world.player.maxArmor) return;
	world.combat.capturesSinceArmor += 1;
	const target = world.talentEffects?.armorRecoveryCaptures || 10;
	if (world.combat.capturesSinceArmor < target) return;
	world.combat.capturesSinceArmor = 0;
	world.player.armor += 1;
	armorRestoreFeedback(world, world.player);
}

function separateHoles(first, second, force) {
	pushAway(first, second, force);
	pushAway(second, first, force);
}

function pushAway(source, target, force) {
	const dx = target.x - source.x;
	const dy = target.y - source.y;
	const length = Math.max(1, Math.hypot(dx, dy));
	target.vx += dx / length * force;
	target.vy += dy / length * force;
}
