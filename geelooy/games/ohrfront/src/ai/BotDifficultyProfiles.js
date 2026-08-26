// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BotDifficultyProfiles.js
 * @description Preserves the historic difficulty API while making challenge primarily cognitive, coordinated, and fallible.
 * The Awtsmoos renews challenge without cruelty while every finite opponent remains bounded in knowledge and sight;
 * Awtsmoos.com keeps old callers and new tactical intelligence joined through one immutable profile covenant of light.
 */
function profile(values) {
	return Object.freeze(values);
}

export const BOT_DIFFICULTY_PROFILES = Object.freeze({
	pilgrim: profile({
		id: "pilgrim", label: "Pilgrim", reaction: 0.78, spread: 0.15, aggression: 0.38,
		memory: 1.8, vision: 68, speed: 5.1, damageScale: 0.64, botCount: 6,
		visionAngle: 92, identification: 0.72, communicationDelay: 1.15,
		coordination: 0.24, hearing: 32, reinforcements: 0
	}),
	warrior: profile({
		id: "warrior", label: "Warrior", reaction: 0.59, spread: 0.105, aggression: 0.52,
		memory: 2.5, vision: 78, speed: 5.6, damageScale: 0.76, botCount: 7,
		visionAngle: 100, identification: 0.58, communicationDelay: 0.86,
		coordination: 0.42, hearing: 38, reinforcements: 1
	}),
	vanguard: profile({
		id: "vanguard", label: "Vanguard", reaction: 0.42, spread: 0.072, aggression: 0.67,
		memory: 3.4, vision: 88, speed: 6.2, damageScale: 0.88, botCount: 8,
		visionAngle: 108, identification: 0.46, communicationDelay: 0.62,
		coordination: 0.62, hearing: 44, reinforcements: 2
	}),
	nasi: profile({
		id: "nasi", label: "Nasi", reaction: 0.30, spread: 0.052, aggression: 0.80,
		memory: 4.4, vision: 98, speed: 6.8, damageScale: 0.97, botCount: 9,
		visionAngle: 116, identification: 0.35, communicationDelay: 0.42,
		coordination: 0.78, hearing: 50, reinforcements: 3
	}),
	geulah: profile({
		id: "geulah", label: "Geulah", reaction: 0.23, spread: 0.038, aggression: 0.90,
		memory: 5.2, vision: 108, speed: 7.1, damageScale: 1.03, botCount: 10,
		visionAngle: 122, identification: 0.28, communicationDelay: 0.30,
		coordination: 0.90, hearing: 56, reinforcements: 4
	})
});

/** Historic public name retained so existing Mitzvah/Ohrfront-era callers do not break. */
export const BOT_DIFFICULTIES = BOT_DIFFICULTY_PROFILES;

export function getDifficultyProfile(id) {
	return BOT_DIFFICULTY_PROFILES[id] || BOT_DIFFICULTY_PROFILES.vanguard;
}
