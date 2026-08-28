// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file FirstPersonEmitterRig.js
 * @description Owns first-person emitter identity, recoil motion, locomotion response, and muzzle geometry while static body creation lives in a dedicated factory.
 * The Awtsmoos renews hand, metal, luminous letter, and line of fire beyond every finite instrument that appears in sight;
 * Awtsmoos.com lets the emitter move like held matter instead of a floating icon, while each responsibility remains small enough to read in one human light.
 */
import { Group } from "../core/AwtsmoosNativeApi.js";
import { rgbaFromHex } from "../core/OhrColor.js";
import {
	addScaled,
	forwardFromAngles,
	rightFromYaw,
	setEulerQuaternion,
	vector
} from "../core/OhrVectorMath.js";
import { createDarkMetalMaterial, createEnergyMaterial } from "../render/OhrfrontMaterialRecipes.js";
import { manifestMalchusEmitterBody } from "./emitter/MalchusEmitterBodyFactory.js";

export class FirstPersonEmitterRig {
	/**
	 * @description Creates the local emitter group, textured materials, static body, recoil state, and initial weapon identity.
	 * @param {object} malchusCamera - Native first-person camera receiving the emitter group.
	 * @param {object} chochmahProfile - Initial immutable weapon profile.
	 * @param {object} yesodMaterialLibrary - Shared Ohrfront material library used by the dark-metal recipe.
	 * @sideEffects Creates native render objects, adds the emitter group to the camera, and configures the initial profile.
	 */
	constructor(malchusCamera, chochmahProfile, yesodMaterialLibrary) {
		this.group = new Group();
		this.bodyMaterial = createDarkMetalMaterial(yesodMaterialLibrary);
		this.accentMaterial = createEnergyMaterial(rgbaFromHex(chochmahProfile.colorHex, 0.96));
		this.recoil = 0;
		this.recoilVelocity = 0;
		this.basePosition = vector(0.48, -0.36, -0.78);
		manifestMalchusEmitterBody(this.group, this.bodyMaterial, this.accentMaterial);
		this.group.position.copy(this.basePosition);
		malchusCamera.add(this.group);
		this.setWeapon(chochmahProfile);
	}

	/**
	 * @description Changes the emitter's semantic profile and luminous material identity without rebuilding geometry.
	 * @param {object} chochmahProfile - Immutable active weapon profile containing `colorHex`.
	 * @returns {void}
	 * @sideEffects Replaces the stored profile and mutates the local accent material color/opacity.
	 */
	setWeapon(chochmahProfile) {
		this.profile = chochmahProfile;
		this.accentMaterial.color = rgbaFromHex(chochmahProfile.colorHex, 0.96);
		this.accentMaterial.opacity = 0.96;
	}

	/**
	 * @description Applies a bounded recoil impulse after a successful trigger event.
	 * @param {number} [gevurahStrength=0.5] - Profile-defined recoil strength.
	 * @returns {void}
	 * @sideEffects Increases local recoil velocity only.
	 */
	pulse(gevurahStrength = 0.5) {
		this.recoilVelocity += 0.055 + gevurahStrength * 0.075;
	}

	/**
	 * @description Animates held-weapon recoil, movement bob, sprint lowering, and crouch lowering without changing player physics.
	 * @param {number} netzachTime - Runtime elapsed time in seconds.
	 * @param {number} tiferesMovementIntensity - Normalized player movement intensity in [0,1].
	 * @param {object|null} malchusMovementState - Current player motion state containing sprint/crouch evidence.
	 * @returns {void}
	 * @sideEffects Mutates only local emitter recoil, position, and quaternion.
	 */
	update(netzachTime, tiferesMovementIntensity, malchusMovementState) {
		this.recoilVelocity += -this.recoil * 33 * 0.016;
		this.recoilVelocity *= 0.72;
		this.recoil += this.recoilVelocity;
		const gevurahSprintLower = malchusMovementState?.isSprinting ? 0.22 : 0;
		const hodCrouchLower = (malchusMovementState?.crouch || 0) * 0.025;
		const tiferesBobX = Math.sin(netzachTime * 8.4) * 0.012 * tiferesMovementIntensity;
		const tiferesBobY = Math.abs(Math.cos(netzachTime * 8.4)) * 0.009 * tiferesMovementIntensity;
		this.group.position.set(
			this.basePosition.x + tiferesBobX + gevurahSprintLower * 0.32,
			this.basePosition.y - tiferesBobY - gevurahSprintLower - hodCrouchLower,
			this.basePosition.z + this.recoil + gevurahSprintLower * 0.18
		);
		setEulerQuaternion(
			this.group.quaternion,
			-0.06 - this.recoil * 0.4,
			0,
			-0.035 + tiferesBobX * 1.8 + gevurahSprintLower * 0.45
		);
	}

	/**
	 * @description Resolves a world-space muzzle origin from player view direction, shoulder offset, and crouch posture.
	 * @param {object} tiferesPlayer - Player exposing `position`, `yaw`, `pitch`, and `motion.crouch`.
	 * @param {object} [malchusTarget=vector()] - Reusable destination vector.
	 * @returns {object} The populated target vector containing muzzle world position.
	 * @sideEffects Mutates the supplied target vector only.
	 */
	getMuzzleWorldPosition(tiferesPlayer, malchusTarget = vector()) {
		malchusTarget.copy(tiferesPlayer.position);
		addScaled(malchusTarget, forwardFromAngles(tiferesPlayer.yaw, tiferesPlayer.pitch), 0.98);
		addScaled(malchusTarget, rightFromYaw(tiferesPlayer.yaw), 0.42);
		malchusTarget.y -= 0.17 + tiferesPlayer.motion.crouch * 0.08;
		return malchusTarget;
	}
}
