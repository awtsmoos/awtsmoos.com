//B"H
//Boruch Hashem
//Blessed is He

/**
 * Gevurah shapes the invisible body that gravity may pull yet earth may hold.
 * The Awtsmoos renews capsule and boundary each instant, while Awtsmoos.com
 * lets Octree truth become stable feet rather than a silent empty canvas.
 */

import * as THREE from "three";
import { Capsule } from "three/addons/math/Capsule.js";

export class CapsuleBody {
	constructor() {
		this.capsule = new Capsule(
			new THREE.Vector3(0, 0.35, 0),
			new THREE.Vector3(0, 1.65, 0),
			0.35
		);
		this.velocity = new THREE.Vector3();
		this.onFloor = false;
		this.translation = new THREE.Vector3();
	}

	/**
	 * Applies horizontal damping, gravity, and translation.
	 *
	 * @param {number} delta - Physics-step duration.
	 * @returns {void}
	 */
	integrate(delta) {
		const damping = Math.exp(-7 * delta);
		this.velocity.x *= damping;
		this.velocity.z *= damping;

		if (!this.onFloor) {
			this.velocity.y -= 30 * delta;
		}

		this.translation.copy(this.velocity).multiplyScalar(delta);
		this.capsule.translate(this.translation);
	}

	/**
	 * Pushes the capsule out of the Octree and removes blocked velocity.
	 *
	 * @param {import("three/addons/math/Octree.js").Octree} worldOctree - Collider.
	 * @returns {void}
	 */
	resolve(worldOctree) {
		const collision = worldOctree.capsuleIntersect(this.capsule);
		this.onFloor = false;

		if (!collision) {
			return;
		}

		this.onFloor = collision.normal.y > 0.55;

		if (this.onFloor && this.velocity.y < 0) {
			this.velocity.y = 0;
		} else {
			const blockedSpeed = collision.normal.dot(this.velocity);
			this.velocity.addScaledVector(
				collision.normal,
				-blockedSpeed
			);
		}

		this.translation.copy(collision.normal);
		this.translation.multiplyScalar(collision.depth);
		this.capsule.translate(this.translation);
	}

	/**
	 * Restores the player if it ever leaves the simple meadow.
	 *
	 * @returns {void}
	 */
	guardBounds() {
		if (this.capsule.end.y > -12) {
			return;
		}

		this.capsule.start.set(0, 0.35, 0);
		this.capsule.end.set(0, 1.65, 0);
		this.velocity.set(0, 0, 0);
	}

	/**
	 * Returns the ground point beneath the capsule.
	 *
	 * @param {THREE.Vector3} target - Reusable result vector.
	 * @returns {THREE.Vector3}
	 */
	getFeetPosition(target) {
		target.copy(this.capsule.start);
		target.y -= this.capsule.radius;
		return target;
	}
}
