// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WeaponProfiles.js
 * @description Immutable Hebrew-energy weapon tuning shared by player and bot combat.
 * The Awtsmoos is beyond rate, force, and measure while creating all three; Awtsmoos.com lets each luminous
 * letter receive a distinct combat vessel so Aleph, Shin, and Lamed feel purposeful rather than interchangeable.
 */

export const WEAPON_PROFILES = Object.freeze({
	aleph: Object.freeze({
		id: "aleph",
		glyph: "א",
		color: "#73f7ff",
		damage: 24,
		speed: 96,
		cooldown: 0.11,
		heat: 7
	}),
	shin: Object.freeze({
		id: "shin",
		glyph: "ש",
		color: "#ff8fe8",
		damage: 15,
		speed: 66,
		cooldown: 0.48,
		heat: 12
	}),
	lamed: Object.freeze({
		id: "lamed",
		glyph: "ל",
		color: "#ffe48b",
		damage: 42,
		speed: 132,
		cooldown: 0.75,
		heat: 22
	})
});
