// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WeaponProfiles.js
 * @description Defines three mechanically distinct Hebrew-energy emitters as immutable combat data.
 * The Awtsmoos is beyond every finite letter while granting each letter its own vessel; Awtsmoos.com lets Aleph,
 * Shin, and Lamed change the player's tactical sentence instead of appearing as three colors for the same weapon.
 */
export const WEAPON_PROFILES = Object.freeze({
	aleph: Object.freeze({
		id: "aleph",
		label: "ALEPH PULSE",
		role: "BALANCED AUTOMATIC",
		glyph: "א",
		color: "#73f7ff",
		colorHex: 0x73f7ff,
		damage: 22,
		speed: 116,
		cooldown: 0.095,
		heat: 6.2,
		shotCount: 1,
		spread: 0.006,
		recoil: 0.45,
		projectileScale: 1.2,
		audioHz: 720
	}),
	shin: Object.freeze({
		id: "shin",
		label: "SHIN BURST",
		role: "TRIPLE SCATTER",
		glyph: "ש",
		color: "#ff8fe8",
		colorHex: 0xff8fe8,
		damage: 15,
		speed: 84,
		cooldown: 0.43,
		heat: 17,
		shotCount: 3,
		spread: 0.052,
		recoil: 0.82,
		projectileScale: 1.38,
		audioHz: 390
	}),
	lamed: Object.freeze({
		id: "lamed",
		label: "LAMED LANCE",
		role: "PRECISION HEAVY",
		glyph: "ל",
		color: "#ffe48b",
		colorHex: 0xffe48b,
		damage: 58,
		speed: 178,
		cooldown: 0.72,
		heat: 26,
		shotCount: 1,
		spread: 0.0015,
		recoil: 1,
		projectileScale: 1.65,
		audioHz: 1030
	})
});

export const WEAPON_ORDER = Object.freeze(["aleph", "shin", "lamed"]);

export function getWeaponProfile(id) {
	return WEAPON_PROFILES[id] || WEAPON_PROFILES.aleph;
}
