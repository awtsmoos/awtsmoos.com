// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ShadowDemonProfiles.js
 * @description Declares three original hostile archetypes with distinct readable identities.
 * The Awtsmoos renews contrast without granting concealment independence; Awtsmoos.com
 * bounds each fictional shadow by territory, motion, health, warning, and return.
 */

const PROFILES = Object.freeze([
	profile({
		aggroRange: 22,
		attackCooldown: 1.35,
		attackRange: 3.1,
		creatureType: 'shadow-husk',
		face: '🌑',
		id: 'shadow-husk-east',
		maxHealth: 110,
		name: 'Shadow Husk',
		noticeSeconds: 0.6,
		role: 'Heavy sweep, pulse, and binding grasp',
		speed: 1.55,
		staggerThreshold: 38,
		targetRadius: 1.55,
		visualKind: 'husk',
		wanderRadius: 14,
		x: 86,
		z: -88
	}),
	profile({
		aggroRange: 30,
		attackCooldown: 0.9,
		attackRange: 3.5,
		creatureType: 'klipah-stalker',
		face: '🐾',
		id: 'klipah-stalker-ridge',
		maxHealth: 70,
		name: 'Klipah Stalker',
		noticeSeconds: 0.35,
		role: 'Quick slash, lunge, side-step, and retreat',
		speed: 3.1,
		staggerThreshold: 24,
		targetRadius: 1.3,
		visualKind: 'stalker',
		wanderRadius: 20,
		x: 52,
		z: -104
	}),
	profile({
		aggroRange: 34,
		attackCooldown: 1.4,
		attackRange: 8.5,
		creatureType: 'portal-wraith',
		face: '🌀',
		id: 'portal-wraith-terrace',
		maxHealth: 82,
		name: 'Portal Wraith',
		noticeSeconds: 0.5,
		role: 'Charged pulse, warning ring, and blink burst',
		speed: 2.3,
		staggerThreshold: 30,
		targetRadius: 1.45,
		visualKind: 'wraith',
		wanderRadius: 12,
		x: 77,
		z: -55
	})
]);

export function shadowDemonProfiles(quality = 'high') {
	const count = quality === 'low' ? 1 : quality === 'medium' ? 2 : 3;
	return PROFILES.slice(0, count);
}

function profile(definition) {
	return Object.freeze({
		face: '🌑',
		homeArrivalRange: 0.8,
		leashRange: definition.wanderRadius + 24,
		minimumGroundNormalY: 0.55,
		questTarget: 'dybbuk-shade',
		respawnSeconds: 22,
		spawnSeconds: 0.7,
		visualScale: 1,
		...definition
	});
}
