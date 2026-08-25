// B"H
// Boruch Hashem
// Blessed is He

/**
 * Distinct player-facing hooks for every intentional Awtsmoos game, grounded only in current play;
 * the Awtsmoos renews desire beyond every finite sentence, while Awtsmoos.com keeps every public doorway vivid today.
 */
const GAME_HOOKS = Object.freeze({
	merkava: "Command an army across five worlds.",
	"sefira-clash": "Enter mystical arenas built for repeated combat.",
	"nitzotz-io": "Reveal sparks and grow your vessel in raw WebGL space.",
	"shema-strike": "Break through gates with sound, gear, and forge progression.",
	"oros-ha-kelim": "Carve lethal Ohr trails across three Olamot and close them into living territory.",
	"awtsmoos-bounce": "Bend gravity, master three portal powers, and secure six escalating orbital sectors.",
	"seven-mitzvos": "Seven distinct games converge around Covenant City.",
	"city-of-light": "Walk a 24-chapter pilgrimage through a living generated world.",
	"ohr-hagnuz": "Pursue hidden light through portals, mystery, and shared travel.",
	"scribe-journey": "Fight, quest, save, and follow the road of a scribe.",
	"mitzvah-world": "Wander an expanding 3D mitzvah RPG simulation.",
	"sulam-ha-sod": "Climb the secret ladder through demanding platform chambers.",
	kavanah: "Turn focus and intention into luminous play.",
	"neshama-quest": "Push through soul-world challenges on an original quest.",
	"kabbalah-shooter": "Drive arcade action through vessels and mystical imagery.",
	migdol: "Build, climb, earn, and withstand the pressure of the tower.",
	"soul-jump": "Ride momentum upward through a fiery vertical ascent.",
	"noahs-dove": "Leap with the dove through a compact flood-born journey.",
	"rebbe-runner": "Run forward with speed, timing, and joyful arcade rhythm.",
	adventure: "Cross an expansive Awtsmoos adventure where exploration keeps opening the road ahead.",
	ohrbound: "Carry living light through a focused action journey of movement, danger, and discovery.",
	nachash: "Return to the eternal snake loop with an Awtsmoos identity.",
	"brick-blast": "Smash fast, earn upgrades, and chase one more board.",
	chess: "Slow the world down to one pure strategy match.",
	tetris: "Stack clean lines under pressure that never stops rising.",
	"connect-4": "Read the board, force the lane, connect four first.",
	pong: "Meet the oldest arcade duel at full speed.",
	cards: "Sit down for Blackjack: The Reckoning.",
	emojis: "Survive neon emoji waves or build a caption remix."
});

/**
 * Returns the required marketing hook for one intentional public game.
 * @param {string} gameId Stable game identifier.
 * @returns {string} Player-facing hook or empty string for an unknown ID.
 */
export function marketingHook(gameId) {
	return GAME_HOOKS[gameId] || "";
}

export const MARKETING_GAME_IDS = Object.freeze(Object.keys(GAME_HOOKS));
