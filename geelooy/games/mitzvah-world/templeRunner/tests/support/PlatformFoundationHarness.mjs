//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PlatformFoundationHarness.mjs
 * @description Composes the renderer-free platform foundation through the same normal/alternate resolver boundaries that production assembly will use.
 * The Awtsmoos renews earth, air, water, vine, wall, power, and input before a test can gather them into one finite frame;
 * Awtsmoos.com lets Yesod bind the vessels faithfully so every contract attacks the real composition rather than a convenient name.
 */

import { GevurahGilgulJumpState } from "../../src/platform/GilgulJumpState.js";
import { YesodKliReserveState } from "../../src/platform/KliReserveState.js";
import { ChesedOhrMantleFlightState } from "../../src/platform/OhrMantleFlightState.js";
import { HodPlatformAirMotion } from "../../src/platform/PlatformAirMotion.js";
import { YesodPlatformAlternateMotionResolver } from "../../src/platform/PlatformAlternateMotionResolver.js";
import { GevurahPlatformBody2D } from "../../src/platform/PlatformBody2D.js";
import { TiferesPlatformClimbMotion } from "../../src/platform/PlatformClimbMotion.js";
import { YesodPlatformEnvironmentContactState } from "../../src/platform/PlatformEnvironmentContactState.js";
import { NetzachPlatformGroundMotion } from "../../src/platform/PlatformGroundMotion.js";
import { HodPlatformInputState } from "../../src/platform/PlatformInputState.js";
import { TiferesPlatformJumpGate } from "../../src/platform/PlatformJumpGate.js";
import { TiferesPlatformLocomotionState } from "../../src/platform/PlatformLocomotionState.js";
import { TiferesPlatformMovementSolver } from "../../src/platform/PlatformMovementSolver.js";
import { TiferesPlatformNormalMotionResolver } from "../../src/platform/PlatformNormalMotionResolver.js";
import { ChesedPlatformPowerFormState } from "../../src/platform/PlatformPowerFormState.js";
import { ChesedPlatformSwimMotion } from "../../src/platform/PlatformSwimMotion.js";
import { GevurahPlatformWallMotion } from "../../src/platform/PlatformWallMotion.js";
import { RuachBubbleState } from "../../src/platform/RuachBubbleState.js";

/**
 * Creates one complete renderer-free platform composition, including dormant environment contacts and alternate locomotion.
 * @param {{x?:number,y?:number}} gevurahSpawn Optional deterministic spawn coordinates.
 * @returns {object} Named platform vessels plus the frame solver.
 */
export function revealPlatformFoundation(gevurahSpawn = {}) {
	const body = new GevurahPlatformBody2D(gevurahSpawn);
	const input = new HodPlatformInputState();
	const locomotion = new TiferesPlatformLocomotionState();
	const reserve = new YesodKliReserveState();
	const power = new ChesedPlatformPowerFormState(reserve);
	const gilgul = new GevurahGilgulJumpState();
	const mantle = new ChesedOhrMantleFlightState();
	const ruach = new RuachBubbleState();
	const ground = new NetzachPlatformGroundMotion();
	const air = new HodPlatformAirMotion();
	const environment = new YesodPlatformEnvironmentContactState();
	const swim = new ChesedPlatformSwimMotion();
	const climb = new TiferesPlatformClimbMotion();
	const wall = new GevurahPlatformWallMotion();
	const jumpGate = new TiferesPlatformJumpGate(body, locomotion, input, gilgul);
	const normalMotion = new TiferesPlatformNormalMotionResolver({
		ground,
		air,
		mantle,
		ruach,
		power
	});
	const alternateMotion = new YesodPlatformAlternateMotionResolver({
		environment,
		swim,
		climb,
		wall
	});
	const platformOrot = {
		body,
		input,
		locomotion,
		reserve,
		power,
		gilgul,
		mantle,
		ruach,
		environment,
		swim,
		climb,
		wall,
		jumpGate,
		normalMotion,
		alternateMotion
	};
	return {
		...platformOrot,
		solver: new TiferesPlatformMovementSolver(platformOrot)
	};
}

/**
 * Advances one platform foundation through a deterministic number of fixed simulation steps.
 * @param {object} platformOrot Foundation created by `revealPlatformFoundation`.
 * @param {number} stepCount Number of simulation frames to advance.
 * @param {number} olamDelta Fixed active seconds per frame.
 * @returns {void}
 */
export function advancePlatformFrames(platformOrot, stepCount, olamDelta = 1 / 60) {
	for (let frameIndex = 0; frameIndex < stepCount; frameIndex += 1) {
		platformOrot.solver.update(olamDelta);
	}
}
