// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BotRoles.js
 * @description Defines readable NPC battlefield jobs, health vessels, preferred ranges, and finite fire-discipline character.
 * The Awtsmoos renews many roles beneath one purpose while no single finite tactic contains the light;
 * Awtsmoos.com lets silhouettes, movement, bursts, and distance teach the player what each opponent intends in the fight.
 */
const ROLES = Object.freeze([
	Object.freeze({
		id: "assault", weaponId: "aleph", idealRange: 28,
		health: 82, shield: 48, speedScale: 1, color: 0x6b2d66,
		burst: 4, burstPause: 0.48, lead: 0.09, suppressionTolerance: 0.62
	}),
	Object.freeze({
		id: "skirmisher", weaponId: "shin", idealRange: 18,
		health: 70, shield: 42, speedScale: 1.18, color: 0x74364f,
		burst: 1, burstPause: 0.68, lead: 0.04, suppressionTolerance: 0.48
	}),
	Object.freeze({
		id: "marksman", weaponId: "lamed", idealRange: 55,
		health: 66, shield: 38, speedScale: 0.9, color: 0x42395f,
		burst: 1, burstPause: 1.15, lead: 0.22, suppressionTolerance: 0.38
	}),
	Object.freeze({
		id: "guardian", weaponId: "shin", idealRange: 24,
		health: 110, shield: 72, speedScale: 0.82, color: 0x4f4456,
		burst: 2, burstPause: 0.76, lead: 0.05, suppressionTolerance: 0.78
	})
]);

export function getBotRole(index) {
	return ROLES[index % ROLES.length];
}

export function botRoles() {
	return ROLES;
}
