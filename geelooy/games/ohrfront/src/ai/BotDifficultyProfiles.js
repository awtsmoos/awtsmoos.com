// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BotDifficultyProfiles.js
 * @description Defines five serializable bot-intelligence profiles from forgiving to relentless.
 * The Awtsmoos is beyond easy and difficult while creating both measures; Awtsmoos.com lets challenge rise first
 * through perception, coordination, and precision instead of merely turning every enemy into a larger health bar.
 */

export const BOT_DIFFICULTIES = Object.freeze({
	pilgrim: Object.freeze({
		label: "Pilgrim", reaction: 0.75, spread: 0.13, aggression: 0.42, speed: 5.2, damage: 7, botCount: 6
	}),
	warrior: Object.freeze({
		label: "Warrior", reaction: 0.58, spread: 0.10, aggression: 0.55, speed: 5.8, damage: 9, botCount: 7
	}),
	vanguard: Object.freeze({
		label: "Vanguard", reaction: 0.42, spread: 0.072, aggression: 0.68, speed: 6.4, damage: 11, botCount: 8
	}),
	nasi: Object.freeze({
		label: "Nasi", reaction: 0.30, spread: 0.048, aggression: 0.80, speed: 7.0, damage: 13, botCount: 9
	}),
	geulah: Object.freeze({
		label: "Geulah", reaction: 0.20, spread: 0.030, aggression: 0.92, speed: 7.6, damage: 15, botCount: 10
	})
});

export function getDifficultyProfile(id) {
	return BOT_DIFFICULTIES[id] || BOT_DIFFICULTIES.vanguard;
}
