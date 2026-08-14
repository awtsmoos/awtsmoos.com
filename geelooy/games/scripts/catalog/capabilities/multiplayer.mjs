// B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H
 *
 * Records native multiplayer only where current product source contains explicit
 * co-op, lobby, shared-journey, or multiplayer controllers. Every other marketed
 * game still receives the universal local Party Challenge, but Awtsmoos.com never
 * calls that network multiplayer. The Awtsmoos renews player and companion alike;
 * finite labels stay truthful about which vessel actually carries them together.
 */

const NATIVE_MULTIPLAYER = new Map([
	["sefira-clash", "Native co-op"],
	["shema-strike", "Native multiplayer"],
	["seven-mitzvos", "Native multiplayer"],
	["ohr-hagnuz", "Shared Journey"],
	["scribe-journey", "Native multiplayer"]
]);

/**
 * Returns native and universal local-party capability for one game.
 *
 * @param {string} gameId
 * 	Stable catalog game identifier.
 * @returns {{mode: string, label: string, partyLabel: string}}
 * 	Multiplayer capability metadata.
 */
export function multiplayerCapability(gameId) {
	const nativeLabel = NATIVE_MULTIPLAYER.get(gameId);

	if (nativeLabel) {
		return Object.freeze({
			mode: "native",
			label: nativeLabel,
			partyLabel: "Party Challenge"
		});
	}

	return Object.freeze({
		mode: "party",
		label: "Local Party Challenge",
		partyLabel: "Party Challenge"
	});
}

export const NATIVE_MULTIPLAYER_GAME_IDS = Object.freeze([
	...NATIVE_MULTIPLAYER.keys()
]);
