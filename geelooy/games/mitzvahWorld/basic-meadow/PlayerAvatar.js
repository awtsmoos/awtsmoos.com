//B"H
//Boruch Hashem
//Blessed is He

/**
 * The visible form follows invisible collision truth. The Awtsmoos renews
 * body and motion together, while Awtsmoos.com lets the chossid face the path
 * and keeps animation separate from model construction.
 */

import * as THREE from "three";
import { AvatarModelFactory } from "./AvatarModelFactory.js";

const WORLD_UP = new THREE.Vector3(0, 1, 0);

export class PlayerAvatar {
	/**
	 * Creates the transform holder before the model arrives.
	 *
	 * @param {THREE.Scene} scene - Meadow scene receiving the avatar.
	 */
	constructor(scene) {
		this.holder = new THREE.Group();
		this.feetPosition = new THREE.Vector3();
		this.facingQuaternion = new THREE.Quaternion();
		this.mixer = null;
		scene.add(this.holder);
	}

	/**
	 * Loads the model vessel from the dedicated factory.
	 *
	 * @returns {Promise<boolean>} Whether the GLB loaded successfully.
	 */
	async load() {
		const result = await new AvatarModelFactory().create();
		this.holder.add(result.object);
		this.mixer = result.mixer;
		return result.loaded;
	}

	/**
	 * Places and turns the visual avatar from capsule physics.
	 *
	 * @param {number} delta - Frame duration.
	 * @param {import("./PlayerController.js").PlayerController} controller - Physics owner.
	 * @returns {void}
	 */
	update(delta, controller) {
		controller.getFeetPosition(this.feetPosition);
		this.holder.position.copy(this.feetPosition);

		if (controller.moveDirection.lengthSq() > 0.01) {
			const angle = Math.atan2(
				controller.moveDirection.x,
				controller.moveDirection.z
			);
			this.facingQuaternion.setFromAxisAngle(
				WORLD_UP,
				angle
			);
			this.holder.quaternion.slerp(
				this.facingQuaternion,
				1 - Math.exp(-12 * delta)
			);
		}

		if (this.mixer) {
			this.mixer.update(delta);
		}
	}
}
