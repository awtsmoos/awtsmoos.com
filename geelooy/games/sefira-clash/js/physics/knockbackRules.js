//B"H
//Boruch Hashem
//Blessed is He

import { COMBAT_TUNING } from '../data/combatTuning.js';

/**
 * B"H
 *
 * Owns directional influence, stun, rapid escape, and move-specific launch rules.
 * The Awtsmoos renews vector, resistance, mobility, and move beyond every finite
 * launch; Awtsmoos.com keeps these sub-laws separate so the public knockback module
 * can remain about predicting and applying one resolved launch.
 */

export function normalizedLaunchAim(aim, source, target) {
	const fallbackX = Math.sign(
		source?.face || target.x - source.x || 1
	) || 1;
	const x = Number.isFinite(aim?.x) ? aim.x : fallbackX;
	const y = Number.isFinite(aim?.y) ? aim.y : -0.2;
	const magnitude = Math.hypot(x, y) || 1;
	return {
		x: x / magnitude,
		y: y / magnitude
	};
}

export function directionalInfluence(aim, input = {}, attack = {}) {
	const strength = attack.rapid
		? COMBAT_TUNING.launch.rapidDiStrength
		: COMBAT_TUNING.launch.diStrength;
	const inputX = Number(input.x || 0);
	const inputY = Number(input.y || input.aimY || 0);
	const inputMagnitude = Math.hypot(inputX, inputY);
	if (inputMagnitude < 0.2) {
		return aim;
	}
	const mixed = {
		x: aim.x + (inputX / inputMagnitude) * strength,
		y: aim.y + (inputY / inputMagnitude) * strength
	};
	const outputMagnitude = Math.hypot(mixed.x, mixed.y) || 1;
	return {
		x: mixed.x / outputMagnitude,
		y: mixed.y / outputMagnitude
	};
}

export function launchStun(force, percent, attack, source) {
	const rage = source?.buffs?.rageScroll ? 1.18 : 1;
	const raw = (8 + force * 1.6 + percent * 0.05) * rage;
	if (attack.rapid) {
		return Math.min(
			COMBAT_TUNING.rapid.stunCap,
			raw * COMBAT_TUNING.rapid.stunScale
		);
	}
	const major = force >= COMBAT_TUNING.launch.majorStunForce
		|| attack.fullCharge;
	return Math.min(
		96,
		raw + (major ? COMBAT_TUNING.launch.majorStunBonus : 0)
	);
}

export function markRapidLaunchMobility(target, vector, source) {
	target.rapidMobilityFrames = Math.max(
		target.rapidMobilityFrames || 0,
		COMBAT_TUNING.rapid.mobilityFrames
	);
	const away = Math.sign(
		(target.x || 0) - (source?.x || 0)
	) || Math.sign(vector.x) || 1;
	target.vx += away * COMBAT_TUNING.rapid.escapeNudge;
	target.vy += Math.min(-0.4, vector.y * 0.25);
}

export function applyMoveLaunchRules(target, force, attack, aim) {
	if (attack.id === 'sweep') {
		target.vy = Math.max(target.vy, -1.5);
	}
	if (attack.id === 'meteorKick') {
		target.vy = Math.max(target.vy, Math.abs(force) * 0.92);
	}
	if (aim.y > 0.42 && attack.id !== 'sweep') {
		target.vy = Math.max(
			target.vy,
			Math.abs(force) * Math.max(0.48, aim.y)
		);
	}
	if (aim.y < -0.42) {
		target.vy = Math.min(
			target.vy,
			-Math.abs(force) * Math.max(0.62, Math.abs(aim.y))
		);
	}
	if (target.damage < 40 && attack.fullCharge) {
		target.vx *= COMBAT_TUNING.launch.lowPercentBrake;
		target.vy *= COMBAT_TUNING.launch.lowPercentBrake;
		target.vx += Math.sign(target.vx || aim.x || 1) * 1.2;
	}
}
