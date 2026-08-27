// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ShadowDemonProfiles.js
 * @description Declares one quality-bounded encounter ring of six distinct shadow hostiles.
 * The Awtsmoos grants concealment no independence; Awtsmoos.com gives every finite enemy
 * a deterministic territory, anatomy, readable tactic, protection, vitality, and reward.
 */

const PROFILES = Object.freeze([
	profile({
		aggroRange: 22, anatomy: { horn: 1.1, lean: -0.06, mass: 1.14 }, armor: 12,
		attackCooldown: 1.35, attackRange: 3.1, creatureType: 'shadow-husk', face: '🌑',
		id: 'shadow-husk-east', level: 3, maxHealth: 110, name: 'Shadow Husk',
		noticeSeconds: 0.6, role: 'Heavy sweep, pulse, and binding grasp', speed: 1.55,
		staggerThreshold: 38, targetRadius: 1.55, visualKind: 'husk', wanderRadius: 14,
		x: 86, xpReward: 90, z: -88
	}),
	profile({
		aggroRange: 30, anatomy: { length: 1.08, limb: 1.04, tail: 1.1 }, armor: 6,
		attackCooldown: 0.9, attackRange: 3.5, creatureType: 'klipah-stalker', face: '🐾',
		id: 'klipah-stalker-ridge', level: 2, maxHealth: 70, name: 'Klipah Stalker',
		noticeSeconds: 0.35, role: 'Quick slash, lunge, side-step, and retreat', speed: 3.1,
		staggerThreshold: 24, targetRadius: 1.3, visualKind: 'stalker', wanderRadius: 20,
		x: 52, xpReward: 65, z: -104
	}),
	profile({
		aggroRange: 34, anatomy: { height: 1.03, horn: 1.1, veil: 1.08 }, armor: 10,
		attackCooldown: 1.4, attackRange: 8.5, creatureType: 'portal-wraith', face: '🌀',
		id: 'portal-wraith-terrace', level: 4, maxHealth: 82, name: 'Portal Wraith',
		noticeSeconds: 0.5, role: 'Charged pulse, warning ring, and blink burst', speed: 2.3,
		staggerThreshold: 30, targetRadius: 1.45, visualKind: 'wraith', wanderRadius: 12,
		x: 77, xpReward: 110, z: -55
	}),
	profile({
		aggroRange: 24, anatomy: { horn: 0.78, lean: 0.08, mass: 0.94 }, armor: 9,
		attackCooldown: 1.05, attackRange: 3.3, creatureType: 'ashen-ravager', face: '🩸',
		id: 'ashen-ravager-gorge', level: 3, maxHealth: 92, name: 'Ashen Ravager',
		noticeSeconds: 0.42, role: 'Shoulder rush, cleaving hook, and stagger chain', speed: 2.15,
		staggerThreshold: 31, targetRadius: 1.42, visualKind: 'husk', wanderRadius: 16,
		x: 38, xpReward: 82, z: -68
	}),
	profile({
		aggroRange: 32, anatomy: { length: 1.18, limb: 1.12, tail: 1.28 }, armor: 5,
		attackCooldown: 0.74, attackRange: 3.65, creatureType: 'rift-stalker', face: '🐺',
		id: 'rift-stalker-west', level: 4, maxHealth: 78, name: 'Rift Stalker',
		noticeSeconds: 0.28, role: 'Pack feint, crossing lunge, and claw recovery', speed: 3.45,
		staggerThreshold: 25, targetRadius: 1.34, visualKind: 'stalker', wanderRadius: 22,
		x: 29, xpReward: 105, z: -96
	}),
	profile({
		aggroRange: 38, anatomy: { height: 1.12, horn: 1.34, veil: 1.22 }, armor: 11,
		attackCooldown: 1.55, attackRange: 9.2, creatureType: 'veil-oracle', face: '👁️',
		id: 'veil-oracle-shelf', level: 5, maxHealth: 104, name: 'Veil Oracle',
		noticeSeconds: 0.55, role: 'Distant omen, converging pulse, and veil displacement', speed: 2.05,
		staggerThreshold: 36, targetRadius: 1.5, visualKind: 'wraith', wanderRadius: 15,
		x: 96, xpReward: 145, z: -74
	})
]);

export function shadowDemonProfiles(quality = 'high') {
	const count = quality === 'low' ? 1 : quality === 'medium' ? 3 : 6;
	return PROFILES.slice(0, count);
}

function profile(definition) {
	return Object.freeze({
		face: '🌑', homeArrivalRange: 0.8, leashRange: definition.wanderRadius + 24,
		minimumGroundNormalY: 0.55, questTarget: 'dybbuk-shade', respawnSeconds: 22,
		spawnSeconds: 0.7, visualScale: 1, ...definition
	});
}
