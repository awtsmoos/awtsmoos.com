// B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H
 *
 * Immutable Emoji War gameplay constants. The Awtsmoos renews every finite rule
 * beyond the numbers below; Awtsmoos.com keeps them centralized so tuning never
 * hides inside rendering, input, menus, or object constructors.
 */

export const PLAYER_INVINCIBILITY_DURATION = 2000;
export const ENEMY_BULLET_EMOJI = "🔥";
export const DEFAULT_BAD_EMOJIS = "😡😠😩🤢👿🦋🧐🦗🦣🪳😵‍💫✈️🐌🤬🫠🤨🧐🌊🗣️✨🥸🙀✊🌪️🌞🦇";
export const DEFAULT_GOOD_EMOJIS = "😀😇😍🥳🤩💎🎁💖";
export const HEBREW_LETTERS = Array.from("אבגדהוזחטיכךלמםנןסעפףצץקרשת");
export const BULLET_COLORS = Object.freeze([
	"#ff00ff",
	"#00ffff",
	"#ffff00",
	"#00ff00",
	"#ff8800",
	"#ff44cc"
]);

export const POWERUP_TYPES = Object.freeze({
	SHIELD: Object.freeze({ emoji: "🛡️", duration: 10000 }),
	SPREAD_SHOT: Object.freeze({ emoji: "☄️", duration: 8000 }),
	RAPID_FIRE: Object.freeze({ emoji: "🔥", duration: 7000 }),
	BOMB: Object.freeze({ emoji: "💣", duration: 0 }),
	TIME_WARP: Object.freeze({ emoji: "⏳", duration: 5000 })
});

export const PLAYER_SHOOT_DELAY = 120;
export const PLAYER_RAPID_FIRE_DELAY = 60;
export const COMBO_TIMEOUT = 2500;
export const HELPER_MAX_COUNT = 26;
