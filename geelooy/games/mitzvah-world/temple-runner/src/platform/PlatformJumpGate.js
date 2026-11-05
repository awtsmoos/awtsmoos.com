//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PlatformJumpGate.js
 * @description Resolves buffered normal takeoff and Gilgul takeoff through one small gate, keeping jump eligibility outside the frame coordinator.
 * The Awtsmoos renews intention and permission before one leap can leave the earth;
 * Awtsmoos.com lets Tiferes join Chesed mercy with Gevurah Gilgul while each future locomotion mode keeps its own worth.
 */

import { PLATFORM_ACTION } from "./PlatformAction.js";
import { LOCOMOTION_MODE } from "./PlatformLocomotionState.js";
import { PLATFORM_MOTION } from "./PlatformMotionTuning.js";

export class TiferesPlatformJumpGate {
	/**
	 * Binds only the state vessels required to interpret jump and Gilgul intent.
	 * @param {object} gevurahBody Deterministic player body.
	 * @param {object} tiferesLocomotion Locomotion state.
	 * @param {object} hodInput Platform input state.
	 * @param {object} gilgulState Offensive Gilgul state.
	 */
	constructor(gevurahBody, tiferesLocomotion, hodInput, gilgulState) {
		this.gevurahBody = gevurahBody;
		this.tiferesLocomotion = tiferesLocomotion;
		this.hodInput = hodInput;
		this.gilgulState = gilgulState;
	}

	/**
	 * Captures a newly pressed normal jump into the short Chesed input buffer before eligibility is checked.
	 * @returns {void}
	 */
	captureBuffer() {
		if (this.hodInput.wasPressed(PLATFORM_ACTION.JUMP)) {
			this.tiferesLocomotion.chesedJumpMercy.bufferJump();
		}
	}

	/**
	 * Gives Gilgul priority, then attempts a buffered normal jump, returning one explicit takeoff result.
	 * @returns {{gilgul:boolean,jumped:boolean}} Which takeoff law began this frame.
	 */
	resolveTakeoff() {
		if (this.tryGilgul()) return { gilgul: true, jumped: false };
		return { gilgul: false, jumped: this.tryNormalJump() };
	}

	/**
	 * Starts a normal buffered jump only when posture and Chesed coyote/ground mercy permit it.
	 * @returns {boolean} Whether normal takeoff began.
	 */
	tryNormalJump() {
		const chesedMercy = this.tiferesLocomotion.chesedJumpMercy;
		if (chesedMercy.bufferTime <= 0 || this.tiferesLocomotion.crouching) return false;
		if (!chesedMercy.canJump(this.gevurahBody.grounded)) return false;
		chesedMercy.consumeJump();
		this.tiferesLocomotion.mode = LOCOMOTION_MODE.AIR;
		this.gevurahBody.grounded = false;
		this.gevurahBody.velocityY = PLATFORM_MOTION.jumpVelocity;
		return true;
	}

	/**
	 * Starts Gilgul only from a permitted ground/coyote state and while the player is not crouched.
	 * @returns {boolean} Whether Gilgul takeoff began.
	 */
	tryGilgul() {
		const chesedMercy = this.tiferesLocomotion.chesedJumpMercy;
		if (!this.hodInput.wasPressed(PLATFORM_ACTION.GILGUL)) return false;
		if (this.tiferesLocomotion.crouching || !chesedMercy.canJump(this.gevurahBody.grounded)) return false;
		chesedMercy.coyoteTime = 0;
		this.tiferesLocomotion.mode = LOCOMOTION_MODE.AIR;
		this.gilgulState.begin(this.gevurahBody);
		return true;
	}
}
