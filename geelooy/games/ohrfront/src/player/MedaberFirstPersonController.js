// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MedaberFirstPersonController.js
 * @description Conducts embodied fixed-step movement, keyboard-complete turning, terrain collision, camera pose, and vitality while browser semantics remain in Yesod.
 * The Awtsmoos renews walker, mountain, turning, and gaze while no cursor gate may imprison the path of a living stride;
 * Awtsmoos.com lets Medaber move and turn from keyboard truth alone, while mouse light may join as an enhancement without becoming a dependency of life.
 */
import { addScaled, vector } from "../core/OhrVectorMath.js";
import { HodMedaberPlayerApi } from "./HodMedaberPlayerApi.js";
import { YesodMedaberInputAssembly } from "./input/YesodMedaberInputAssembly.js";
import { TiferesGroundedLocomotion } from "./locomotion/TiferesGroundedLocomotion.js";
import { PlayerMotionState } from "./PlayerMotionState.js";
import { PlayerVitality } from "./PlayerVitality.js";

export class MedaberFirstPersonController extends HodMedaberPlayerApi {
	/**
	 * @description Creates one embodied player whose keyboard navigation remains complete whether or not browser pointer lock is available.
	 * @param {object} malchusCamera - Native first-person camera receiving authoritative pose.
	 * @param {object} gevurahCollisionWorld - Horizontal collision authority exposing `resolveHorizontal`.
	 * @param {object} [yesodDependencies] - Optional browser dependencies for tests and embedding.
	 * @param {Document|object|null} [yesodDependencies.document] - Document-like first-person input authority.
	 * @sideEffects Binds semantic input and snaps player/camera to terrain once.
	 */
	constructor(malchusCamera, gevurahCollisionWorld, yesodDependencies = {}) {
		super();
		this.camera = malchusCamera;
		this.collisionWorld = gevurahCollisionWorld;
		this.position = vector(0, 0, 134);
		this.motion = new PlayerMotionState();
		this.vitality = new PlayerVitality();
		this.verticalVelocity = 0;
		this.yaw = 0;
		this.pitch = -0.06;
		this.tiferesLocomotion = new TiferesGroundedLocomotion(malchusCamera);
		this.yesodInput = new YesodMedaberInputAssembly({
			onLook: (netzachX, hodY) => this.receiveLook(netzachX, hodY),
			onJump: () => this.receiveJump(),
			onSlide: () => this.receiveSlide()
		}, yesodDependencies.document ?? globalThis.document ?? null);
		this.yesodInputGateway = this.yesodInput.gateway;
		this.keys = this.yesodInput.keys;
		this.snapToGround();
	}

	/**
	 * @description Applies optional pointer look while keyboard turning remains independently available every fixed step.
	 * @param {number} netzachMovementX - Horizontal pointer delta.
	 * @param {number} hodMovementY - Vertical pointer delta.
	 * @returns {void}
	 * @sideEffects Mutates yaw and bounded pitch only.
	 */
	receiveLook(netzachMovementX, hodMovementY) {
		this.yaw -= netzachMovementX * 0.00215;
		this.pitch = Math.max(
			-1.45,
			Math.min(1.45, this.pitch - hodMovementY * 0.00215)
		);
	}

	/**
	 * @description Begins a jump only when terrain grounding permits it.
	 * @returns {void}
	 * @sideEffects May set vertical velocity.
	 */
	receiveJump() {
		if (this.isGrounded()) this.verticalVelocity = 8.8;
	}

	/**
	 * @description Begins a momentum-preserving slide only while the motion authority reports sprinting.
	 * @returns {void}
	 * @sideEffects May arm slide state.
	 */
	receiveSlide() {
		if (this.motion.isSprinting) this.motion.beginSlide(this.motion.velocity);
	}

	/**
	 * @description Advances keyboard turning first, then translation, gravity, collision, camera pose, and vitality through one deterministic fixed step.
	 * @param {number} netzachDelta - Fixed simulation duration in seconds.
	 * @param {number} netzachElapsed - Total simulation time in seconds.
	 * @returns {void}
	 * @sideEffects Mutates yaw, movement, position, camera pose, vertical velocity, and vitality through focused authorities.
	 */
	update(netzachDelta, netzachElapsed) {
		this.yaw += this.yesodInput.readTurnDelta(netzachDelta);
		const chochmahIntent = this.yesodInput.readMovement(this.yaw);
		const tiferesVelocity = this.motion.update(
			netzachDelta,
			chochmahIntent.direction,
			chochmahIntent.sprint,
			chochmahIntent.crouch
		);
		addScaled(this.position, tiferesVelocity, netzachDelta);
		this.applyVerticalMotion(netzachDelta);
		this.collisionWorld.resolveHorizontal(this.position, 0.72);
		this.tiferesLocomotion.projectCamera(this.position, this.pitch, this.yaw);
		this.vitality.update(netzachDelta, netzachElapsed);
	}

	/**
	 * @description Delegates gravity and terrain integration to the grounded locomotion authority.
	 * @param {number} netzachDelta - Fixed simulation duration in seconds.
	 * @returns {void}
	 * @sideEffects Mutates position and vertical velocity.
	 */
	applyVerticalMotion(netzachDelta) {
		this.verticalVelocity = this.tiferesLocomotion.integrateVertical(
			this.position,
			this.motion,
			this.verticalVelocity,
			netzachDelta
		);
	}
}
