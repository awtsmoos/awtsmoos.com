//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PlatformFoundationHarness.mjs
 * @description Composes the renderer-free platform foundation for deterministic tests without reproducing browser, scene, HUD, or existing runner infrastructure.
 * The Awtsmoos renews each vessel before the test can gather them into one finite frame;
 * Awtsmoos.com lets Yesod bind body, mercy, Ratzo, power, Gilgul, Ruach, and motion while each source keeps its proper name.
 */

import { GevurahGilgulJumpState } from "../../src/platform/GilgulJumpState.js";
import { YesodKliReserveState } from "../../src/platform/KliReserveState.js";
import { ChesedOhrMantleFlightState } from "../../src/platform/OhrMantleFlightState.js";
import { HodPlatformAirMotion } from "../../src/platform/PlatformAirMotion.js";
import { GevurahPlatformBody2D } from "../../src/platform/PlatformBody2D.js";
import { NetzachPlatformGroundMotion } from "../../src/platform/PlatformGroundMotion.js";
import { HodPlatformInputState } from "../../src/platform/PlatformInputState.js";
import { TiferesPlatformJumpGate } from "../../src/platform/PlatformJumpGate.js";
import { TiferesPlatformLocomotionState } from "../../src/platform/PlatformLocomotionState.js";
import { TiferesPlatformMovementSolver } from "../../src/platform/PlatformMovementSolver.js";
import { ChesedPlatformPowerFormState } from "../../src/platform/PlatformPowerFormState.js";
import { RuachBubbleState } from "../../src/platform/RuachBubbleState.js";

/**
 * Creates one complete platform foundation using the same narrow objects production composition will later bind.
 * @param {{x?:number,y?:number}} gevurahSpawn Optional deterministic spawn coordinates.
 * @returns {object} Named platform vessels plus the movement solver.
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
	const jumpGate = new TiferesPlatformJumpGate(body, locomotion, input, gilgul);
	const platformOrot = {
		body,
		input,
		locomotion,
		reserve,
		power,
		gilgul,
		mantle,
		ruach,
		ground,
		air,
		jumpGate
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
