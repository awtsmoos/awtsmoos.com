//B"H
//Boruch Hashem
//Blessed is He

/**
 * Chai turns keys into camera-relative intention while the CapsuleBody keeps
 * physical truth. The Awtsmoos renews will and motion; Awtsmoos.com lets the
 * chossid walk, run, jump, and meet the meadow without the former world graph.
 */

import * as THREE from "three";
import { CapsuleBody } from "./CapsuleBody.js";

const WORLD_UP = new THREE.Vector3(0, 1, 0);

export class PlayerController {
	/**
	 * Creates movement intention around a focused collision body.
	 *
	 * @param {import("./KeyboardInput.js").KeyboardInput} input - Key-state source.
	 * @param {import("three/addons/math/Octree.js").Octree} worldOctree - Collider.
	 */
	constructor(input, worldOctree) {
		this.input = input;
		this.worldOctree = worldOctree;
		this.body = new CapsuleBody();
		this.moveDirection = new THREE.Vector3();
		this.forward = new THREE.Vector3();
		this.right = new THREE.Vector3();
	}

	/**
	 * Advances intention and collision through stable substeps.
	 *
	 * @param {number} delta - Frame duration in seconds.
	 * @param {THREE.Camera} camera - Camera defining horizontal directions.
	 * @returns {void}
	 */
	update(delta, camera) {
		const stepCount = 4;
		const stepDelta = delta / stepCount;

		for (let step = 0; step < stepCount; step += 1) {
			this.applyInput(stepDelta, camera);
			this.body.integrate(stepDelta);
			this.body.resolve(this.worldOctree);
			this.body.guardBounds();
		}
	}

	/**
	 * Converts keyboard intention into acceleration and jumping.
	 *
	 * @param {number} delta - Physics-step duration.
	 * @param {THREE.Camera} camera - Directional reference.
	 * @returns {void}
	 */
	applyInput(delta, camera) {
		const movement = this.input.readMovement();

		camera.getWorldDirection(this.forward);
		this.forward.y = 0;
		this.forward.normalize();
		this.right.crossVectors(this.forward, WORLD_UP).normalize();

		this.moveDirection.set(0, 0, 0);
		this.moveDirection.addScaledVector(
			this.forward,
			movement.forward
		);
		this.moveDirection.addScaledVector(
			this.right,
			movement.right
		);

		if (this.moveDirection.lengthSq() > 1) {
			this.moveDirection.normalize();
		}

		const acceleration = this.body.onFloor ? 34 : 11;
		this.body.velocity.addScaledVector(
			this.moveDirection,
			acceleration * delta
		);

		if (movement.jump && this.body.onFloor) {
			this.body.velocity.y = 9.5;
			this.body.onFloor = false;
		}
	}

	/**
	 * Exposes the body's grounded point without exposing mutation details.
	 *
	 * @param {THREE.Vector3} target - Reusable result vector.
	 * @returns {THREE.Vector3}
	 */
	getFeetPosition(target) {
		return this.body.getFeetPosition(target);
	}
}
