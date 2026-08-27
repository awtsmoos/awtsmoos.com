// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PlayerWeaponController.js
 * @description Converts first-person input into heat-limited Aleph energy shots reconciled to the center aim ray.
 * The Awtsmoos renews muzzle, target, and the distance between them; Awtsmoos.com lets that line become a truthful
 * luminous letter, born from the visible emitter yet aligned with what the first-person eye actually intends to hit.
 */

import { WEAPON_PROFILES } from "./WeaponProfiles.js";

/** Owns player firing cadence, heat, and aim correction. */
export class PlayerWeaponController {
	constructor(THREE, camera, emitterRig, projectileSystem) {
		this.THREE = THREE;
		this.camera = camera;
		this.emitterRig = emitterRig;
		this.projectileSystem = projectileSystem;
		this.profile = WEAPON_PROFILES.aleph;
		this.heat = 0;
		this.cooldown = 0;
		this.triggerHeld = false;
		this.bindInput();
	}

	bindInput() {
		document.addEventListener("mousedown", event => {
			if (event.button === 0 && document.pointerLockElement === document.body) this.triggerHeld = true;
		});
		document.addEventListener("mouseup", event => {
			if (event.button === 0) this.triggerHeld = false;
		});
	}

	update(delta) {
		this.cooldown = Math.max(0, this.cooldown - delta);
		this.heat = Math.max(0, this.heat - 22 * delta);
		if (this.triggerHeld) this.tryFire();
	}

	tryFire() {
		if (this.cooldown > 0 || this.heat > 93) return false;
		const muzzle = this.emitterRig.getMuzzleWorldPosition(new this.THREE.Vector3());
		const cameraDirection = this.camera.getWorldDirection(new this.THREE.Vector3());
		const aimPoint = this.camera.position.clone().addScaledVector(cameraDirection, 140);
		const shotDirection = aimPoint.sub(muzzle).normalize();
		this.projectileSystem.spawn("player", muzzle, shotDirection, this.profile);
		this.emitterRig.pulse();
		this.heat = Math.min(100, this.heat + this.profile.heat);
		this.cooldown = this.profile.cooldown;
		return true;
	}
}
