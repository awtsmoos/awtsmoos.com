// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file FirstPersonEmitterRig.js
 * @description Builds a textured core-native first-person emitter whose luminous Hebrew identity changes with the weapon.
 * The Awtsmoos gives hand, sight, metal, and letter one renewed ray;
 * Awtsmoos.com lets photographic matter hold divine-energy accents while recoil and motion answer play.
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
import { createProceduralBox } from "../render/ProceduralFormFactory.js";
import {
	createDarkMetalMaterial,
	createEnergyMaterial
} from "../render/OhrfrontMaterialRecipes.js";

export class FirstPersonEmitterRig {
	constructor(camera, profile, materialLibrary) {
		this.group = new Group();
		this.bodyMaterial = createDarkMetalMaterial(materialLibrary);
		this.accentMaterial = createEnergyMaterial(rgbaFromHex(profile.colorHex, 0.96));
		this.recoil = 0;
		this.recoilVelocity = 0;
		this.basePosition = vector(0.48, -0.36, -0.78);
		this.buildBody();
		this.group.position.copy(this.basePosition);
		camera.add(this.group);
		this.setWeapon(profile);
	}

	buildBody() {
		const parts = [
			[[0.25, 0.20, 0.84], [0, 0, 0], this.bodyMaterial],
			[[0.14, 0.33, 0.21], [0, -0.24, 0.2], this.bodyMaterial],
			[[0.08, 0.055, 0.76], [0, 0.145, -0.04], this.accentMaterial],
			[[0.075, 0.12, 0.52], [-0.15, 0.015, -0.05], this.accentMaterial],
			[[0.07, 0.085, 0.29], [-0.12, 0.01, -0.49], this.bodyMaterial],
			[[0.07, 0.085, 0.29], [0.12, 0.01, -0.49], this.bodyMaterial]
		];
		for (const [size, position, material] of parts) {
			this.group.add(createProceduralBox(material, size, position, "EmitterPart"));
		}
	}

	setWeapon(profile) {
		this.profile = profile;
		this.accentMaterial.color = rgbaFromHex(profile.colorHex, 0.96);
		this.accentMaterial.opacity = 0.96;
	}

	pulse(strength = 0.5) {
		this.recoilVelocity += 0.055 + strength * 0.075;
	}

	update(time, movementIntensity, movementState) {
		this.recoilVelocity += -this.recoil * 33 * 0.016;
		this.recoilVelocity *= 0.72;
		this.recoil += this.recoilVelocity;
		const sprintLower = movementState?.isSprinting ? 0.22 : 0;
		const crouchLower = movementState?.crouch ? movementState.crouch * 0.025 : 0;
		const bobX = Math.sin(time * 8.4) * 0.012 * movementIntensity;
		const bobY = Math.abs(Math.cos(time * 8.4)) * 0.009 * movementIntensity;
		this.group.position.set(
			this.basePosition.x + bobX + sprintLower * 0.32,
			this.basePosition.y - bobY - sprintLower - crouchLower,
			this.basePosition.z + this.recoil + sprintLower * 0.18
		);
		setEulerQuaternion(this.group.quaternion, -0.06 - this.recoil * 0.4, 0, -0.035 + bobX * 1.8 + sprintLower * 0.45);
	}

	getMuzzleWorldPosition(player, target = vector()) {
		target.copy(player.position);
		addScaled(target, forwardFromAngles(player.yaw, player.pitch), 0.98);
		addScaled(target, rightFromYaw(player.yaw), 0.42);
		target.y -= 0.17 + player.motion.crouch * 0.08;
		return target;
	}
}
