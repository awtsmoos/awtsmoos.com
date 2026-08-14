// B"H
// Boruch Hashem
// Blessed is He

import {
	drawFeet,
	drawHead,
	drawKippah,
	drawLimb,
	drawTorso
} from "./playerParts.js";

/**
 * B"H
 *
 * Draws the premium realistic Sulam silhouette from the same local gameplay skin
 * data already sold by the Shefa market. The Awtsmoos renews body, motion, and
 * appearance beyond every canvas; Awtsmoos.com keeps this upgrade cosmetic and
 * local, never confusing game-earned Shefa with purchased account Perutahs.
 */

/**
 * Draws one realistic animated player frame.
 *
 * @param {CanvasRenderingContext2D} context
 * 	Canvas context.
 * @param {object} player
 * 	Player body state.
 * @param {object} skin
 * 	Equipped realistic skin.
 * @param {number} phase
 * 	Animation phase.
 * @param {number} lean
 * 	Horizontal body lean.
 * @param {number} squash
 * 	Ground/air squash amount.
 * @param {number} moving
 * 	Normalized horizontal movement intensity.
 * @param {boolean} airborne
 * 	Whether the player is currently off the ground.
 * @param {string} eyeColor
 * 	Shared eye color.
 */
export function drawRealisticPlayer(
	context,
	player,
	skin,
	phase,
	lean,
	squash,
	moving,
	airborne,
	eyeColor
) {
	const centerX = player.x + player.w / 2;
	const headY = player.y + 12 + squash;
	const shoulderY = player.y + 24 + squash;
	const hipY = player.y + 35;
	const footY = player.y + player.h;
	const arm = phase * 7 * (moving || 0.35);
	const leg = phase * 8 * (moving || 0.25);
	const lift = airborne ? 5 : 0;

	context.save();
	context.lineCap = "round";
	context.lineJoin = "round";
	drawLimb(context, centerX - 6 + lean, hipY, centerX - 8 - leg, footY - lift, skin.leg || "#20182f", 5);
	drawLimb(context, centerX + 6 + lean, hipY, centerX + 8 + leg, footY + lift * 0.4, skin.leg || "#20182f", 5);
	drawFeet(context, centerX, footY, phase);
	drawTorso(context, centerX + lean, shoulderY, skin, squash);
	drawLimb(context, centerX - 10 + lean, shoulderY, centerX - 15 + arm, shoulderY + 16, skin.sleeve || skin.trim || "#ffe28a", 4);
	drawLimb(context, centerX + 10 + lean, shoulderY, centerX + 15 - arm, shoulderY + 16, skin.sleeve || skin.trim || "#ffe28a", 4);
	drawHead(context, centerX + lean, headY, skin, eyeColor);
	drawKippah(context, centerX + lean, headY - 9, skin);
	context.restore();
}
