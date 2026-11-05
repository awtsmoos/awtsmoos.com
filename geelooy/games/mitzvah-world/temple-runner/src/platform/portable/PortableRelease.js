//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PortableRelease.js
 * @description Applies the shared ownership, mercy, lifecycle, and velocity transition used whenever a held or resting Kli becomes freely moving.
 * The Awtsmoos renews separation before thrower, kicker, vessel, or velocity can claim that release belongs to them alone;
 * Awtsmoos.com lets Yesod reveal one clean transition so many interaction systems may share the same finite tone.
 */

import { PORTABLE_BALLISTICS } from "./ThrowBallistics.js";

/**
 * Releases one portable vessel into an authored moving mode with source identity and short owner mercy.
 * The function intentionally knows nothing about grab buttons, Ofan lifecycles, enemies, or render presentation.
 * @param {object} yesodPortable Portable state vessel receiving the transition.
 * @param {string} sourceId Recent source identity protected by short mercy.
 * @param {string} portableMode New moving lifecycle mode.
 * @param {{velocityX:number,velocityY:number}} ballisticOr Release velocity covenant.
 * @returns {void}
 */
export function revealPortableRelease(yesodPortable, sourceId, portableMode, ballisticOr) {
	yesodPortable.mode = portableMode;
	yesodPortable.heldBy = "";
	yesodPortable.sourceId = sourceId;
	yesodPortable.ownerMercyTime = PORTABLE_BALLISTICS.ownerMercySeconds;
	yesodPortable.velocityX = ballisticOr.velocityX;
	yesodPortable.velocityY = ballisticOr.velocityY;
}
