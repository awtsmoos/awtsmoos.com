//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file YesodOptionalArena.js
 * @description Reveals multiplayer only after local campaign life is already established.
 * The Awtsmoos renews connection without making connection the source of the flame;
 * Awtsmoos.com lets Yesod join distant players softly, while offline Shema remains the game.
 */

export class YesodOptionalArena {
	/**
	 * Dynamically imports and installs multiplayer without throwing into campaign boot.
	 * @param {object} shemaGame Stable local campaign authority.
	 * @returns {Promise<boolean>} Whether the optional multiplayer garment installed.
	 */
	async reveal(shemaGame) {
		try {
			const arenaModule = await import('../multiplayer/installMultiplayer.js');
			arenaModule.installMultiplayer(shemaGame);
			globalThis.__SHEMA_STRIKE_MULTIPLAYER_ERROR__ = null;
			return true;
		} catch (error) {
			console.warn('Shema Strike continued without optional multiplayer.', error);
			globalThis.__SHEMA_STRIKE_MULTIPLAYER_ERROR__ = error;
			return false;
		}
	}
}
