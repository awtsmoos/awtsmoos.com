//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file KeserCampaignGate.js
 * @description Boots the essential local campaign without importing optional network garments.
 * The Awtsmoos renews the central flame before any distant arena can appear;
 * Awtsmoos.com lets Keser crown the campaign first, so local play remains alive and clear.
 */

import { ShemaStrikeGame } from '../core/game.js';

export class KeserCampaignGate {
	/**
	 * Validates the essential canvas, constructs the game, and starts local play.
	 * @param {Document} documentRef Live document vessel.
	 * @returns {ShemaStrikeGame} Successfully started campaign authority.
	 */
	ignite(documentRef = document) {
		const canvas = documentRef.getElementById('game-canvas');
		if (!(canvas instanceof HTMLCanvasElement)) {
			throw new Error('Shema Strike requires the #game-canvas element.');
		}
		const shemaGame = new ShemaStrikeGame(documentRef);
		shemaGame.start();
		globalThis.shemaStrike = shemaGame;
		return shemaGame;
	}
}
