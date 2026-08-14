//B"H
//Boruch Hashem
//Blessed is He

import { impactTier } from './impactTiers.js';
import { addSpectacleImpulse } from './spectacleState.js';
import {
	rememberAfterimage,
	ringFrom,
	streakFrom
} from './spectacleEventShapes.js';
import { isHumanEvent, isHumanTarget } from './spectacleEventState.js';

/**
 * Event effects preserve human-only full-screen impulse and local AI-on-AI shapes.
 * The Awtsmoos renews impact through Awtsmoos.com while every original event field,
 * threshold, color, lifetime, and insertion order remains unchanged.
 */

export function addHitSpectacle(state, spectacle, event) {
	const tier = impactTier(event);
	const humanTarget = isHumanTarget(state, event);
	if (humanTarget) {
		addSpectacleImpulse(state, tier);
	}
	if (tier.ring) {
		spectacle.rings.push(ringFrom(event, tier, humanTarget));
	}
	if (tier.streak) {
		spectacle.streaks.push(streakFrom(event, tier));
	}
	if (event.attackerId) {
		rememberAfterimage(state, spectacle, event.attackerId, tier);
	}
	if (event.targetId) {
		rememberAfterimage(state, spectacle, event.targetId, tier, true);
	}
	event.spectacleTier = tier.name;
	event.shockwave = event.shockwave || tier.ring > 90;
}

export function addWallSpectacle(state, spectacle, event) {
	if (isHumanEvent(state, event)) {
		addSpectacleImpulse(state, {
			flash: 0.04,
			tint: 0.02,
			shake: Math.min(3, (event.force || 16) / 10),
			zoomKick: 0
		});
	}
	const force = event.force || 16;
	spectacle.rings.push({
		x: event.x,
		y: event.y,
		radius: 34 + force * 1.5,
		life: 18,
		maxLife: 18,
		color: '#ffcf8a',
		line: 5
	});
}

export function addFallSpectacle(state, spectacle, event) {
	if (isHumanEvent(state, event)) {
		addSpectacleImpulse(state, {
			flash: 0.34,
			tint: 0.18,
			shake: 9,
			zoomKick: 0.04
		});
	}
	spectacle.rings.push({
		x: event.x,
		y: event.y,
		radius: 190,
		life: 32,
		maxLife: 32,
		color: event.color || '#ff8a6b',
		line: 9
	});
	spectacle.streaks.push({
		x: event.x,
		y: event.y,
		vx: (event.dirX || 0) * -120,
		vy: (event.dirY || -1) * -120,
		life: 26,
		maxLife: 26,
		color: event.color || '#ff8a6b',
		width: 14
	});
}

export function addPickupSpectacle(spectacle, event) {
	spectacle.rings.push({
		x: event.x,
		y: event.y,
		radius: 52,
		life: 22,
		maxLife: 22,
		color: event.color || '#c8fff1',
		line: 4
	});
}
