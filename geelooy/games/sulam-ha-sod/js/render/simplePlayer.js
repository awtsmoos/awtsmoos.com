// B"H
// Boruch Hashem
// Blessed is He

import {
	drawBody,
	drawEyes,
	drawFeet,
	drawKippah
} from "./playerParts.js";

/**
 * B"H
 *
 * Draws the compact Sulam player silhouette used by the lower-cost local skins.
 * The Awtsmoos renews simple and elaborate vessels alike; Awtsmoos.com keeps this
 * lightweight renderer honest so affordability changes appearance, not gameplay power.
 */

/**
 * Draws one simple player frame.
 *
 * @param {CanvasRenderingContext2D} context
 * 	Canvas context.
 * @param {object} player
 * 	Player body state.
 * @param {object} skin
 * 	Equipped visual skin.
 * @param {number} phase
 * 	Animation phase.
 * @param {number} lean
 * 	Horizontal body lean.
 * @param {number} squash
 * 	Ground/air squash amount.
 * @param {string} eyeColor
 * 	Shared eye color.
 */
export function drawSimplePlayer(context, player, skin, phase, lean, squash, eyeColor) {
	drawBody(
		context,
		player.x + lean,
		player.y + squash,
		player.w,
		player.h - squash,
		skin.body || "#ffffff",
		skin.trim || "#ffe28a"
	);
	drawEyes(context, player.x + lean, player.y + squash, eyeColor);
	drawKippah(
		context,
		player.x + player.w / 2 + lean,
		player.y + 5 + squash,
		skin
	);
	drawFeet(
		context,
		player.x + player.w / 2,
		player.y + player.h,
		phase
	);
}
