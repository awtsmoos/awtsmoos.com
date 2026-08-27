// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MedaberFirstPersonController.js
 * @description Composes semantic intent, embodied motion, terrain grounding, collision, camera pose, and vitality while inheriting stable public lifecycle/read behavior from Hod.
 * The Awtsmoos renews walker, mountain, gaze, and breath while no finite controller can contain the Source of every stride;
 * Awtsmoos.com lets Medaber conduct active motion in one vessel while Hod reveals measured testimony and return through another, ordered and alive.
 */
import { addScaled, vector } from "../core/OhrVectorMath.js";
import { HodMedaberPlayerApi } from "./HodMedaberPlayerApi.js";
import { ChochmahMovementIntentReader } from "./input/ChochmahMovementIntentReader.js";
import { YesodFirstPersonInputGateway } from "./input/YesodFirstPersonInputGateway.js";
import { TiferesGroundedLocomotion } from "./locomotion/TiferesGroundedLocomotion.js";
import { PlayerMotionState } from "./PlayerMotionState.js";
import { PlayerVitality } from "./PlayerVitality.js";

export class MedaberFirstPersonController extends HodMedaberPlayerApi {
	/**
	 * @description Creates the embodied player facade while browser intent, movement, vitality, grounding, and public evidence remain focused collaborators.
	 * @param {object} malchusCamera - Native first-person camera receiving authoritative pose.
	 * @param {object} gevurahCollisionWorld - Horizontal collision authority exposing `resolveHorizontal`.
	 * @param {object} [yesodDependencies] - Optional advanced dependencies for tests and embedding.
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
		this.yesodInputGateway = this.createYesodInputGateway(yesodDependencies.document);
		this.keys = this.yesodInputGateway.keys;
		this.chochmahMovementIntent = new ChochmahMovementIntentReader(this.keys);
		this.bindInput();
		this.snapToGround();
	}

	/**
	 * @description Creates the semantic browser boundary around this controller's intention methods.
	 * @param {Document|object|null|undefined} yesodDocument - Optional injected browser or test document.
	 * @returns {YesodFirstPersonInputGateway} Unbound input gateway configured with semantic callbacks.
	 * @sideEffects Allocates the gateway only; binding occurs separately.
	 */
	createYesodInputGateway(yesodDocument) {
		return new YesodFirstPersonInputGateway({
			onLook: (netzachX, hodY) => this.receiveLook(netzachX, hodY),
			onJump: () => this.receiveJump(),
			onSlide: () => this.receiveSlide()
		}, yesodDocument ?? globalThis.document ?? null);
	}

	/** @description Binds semantic input idempotently. @returns {void} @sideEffects May add browser listeners once. */
	bindInput() {
		this.yesodInputGateway.bind();
	}

	/**
	 * @description Applies validated look deltas to bounded yaw and pitch.
	 * @param {number} netzachMovementX - Horizontal pointer delta.
	 * @param {number} hodMovementY - Vertical pointer delta.
	 * @returns {void}
	 * @sideEffects Mutates yaw and pitch only.
	 */
	receiveLook(netzachMovementX, hodMovementY) {
		this.yaw -= netzachMovementX * 0.00215;
		this.pitch = Math.max(-1.45, Math.min(1.45, this.pitch - hodMovementY * 0.00215));
	}

	/** @description Begins a jump only when terrain grounding permits it. @returns {void} @sideEffects May set vertical velocity. */
	receiveJump() {
		if (this.isGrounded()) this.verticalVelocity = 8.8;
	}

	/** @description Begins a momentum-preserving slide only while sprinting. @returns {void} @sideEffects May arm motion slide state. */
	receiveSlide() {
		if (this.motion.isSprinting) this.motion.beginSlide(this.motion.velocity);
	}

	/**
	 * @description Advances semantic horizontal intention, gravity, collision, camera pose, and vitality through one fixed simulation step.
	 * @param {number} netzachDelta - Fixed simulation duration in seconds.
	 * @param {number} netzachElapsed - Total simulation time in seconds.
	 * @returns {void}
	 * @sideEffects Mutates movement, position, camera pose, vertical velocity, and vitality through focused authorities.
	 */
	update(netzachDelta, netzachElapsed) {
		const chochmahIntent = this.chochmahMovementIntent.read(this.yaw);
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

	/** @description Delegates gravity and terrain integration. @param {number} netzachDelta - Fixed step seconds. @returns {void} @sideEffects Mutates position and vertical velocity. */
	applyVerticalMotion(netzachDelta) {
		this.verticalVelocity = this.tiferesLocomotion.integrateVertical(
			this.position,
			this.motion,
			this.verticalVelocity,
			netzachDelta
		);
	}
}
