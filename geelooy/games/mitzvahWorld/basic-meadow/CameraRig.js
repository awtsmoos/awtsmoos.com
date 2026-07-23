//B"H
//Boruch Hashem
//Blessed is He

/**
 * Tiferes joins freedom and stability: the camera follows gently yet turns
 * when the player asks. The Awtsmoos renews viewpoint and viewed alike, while
 * Awtsmoos.com opens a clear window into the finite meadow.
 */

import * as THREE from "three";

export class CameraRig {
	/**
	 * Connects pointer-lock look controls to the third-person camera.
	 *
	 * @param {THREE.PerspectiveCamera} camera - Camera to position.
	 * @param {HTMLCanvasElement} canvas - Pointer-lock surface.
	 */
	constructor(camera, canvas) {
		this.camera = camera;
		this.canvas = canvas;
		this.yaw = 0;
		this.height = 3.1;
		this.distance = 5.8;
		this.target = new THREE.Vector3();
		this.desiredPosition = new THREE.Vector3();

		canvas.addEventListener("click", () => {
			canvas.requestPointerLock();
		});

		document.addEventListener("mousemove", (event) => {
			if (document.pointerLockElement !== canvas) {
				return;
			}

			this.yaw -= event.movementX * 0.0024;
			this.height = THREE.MathUtils.clamp(
				this.height + event.movementY * 0.006,
				1.8,
				5.2
			);
		});
	}

	/**
	 * Follows the player's head with smooth horizontal orbiting.
	 *
	 * @param {number} delta - Frame duration.
	 * @param {import("./PlayerController.js").PlayerController} controller - Player.
	 * @returns {void}
	 */
	update(delta, controller) {
		controller.getFeetPosition(this.target);
		this.target.y += 1.25;

		this.desiredPosition.set(
			Math.sin(this.yaw) * this.distance,
			this.height,
			Math.cos(this.yaw) * this.distance
		);
		this.desiredPosition.add(this.target);

		const followStrength = 1 - Math.exp(-8 * delta);
		this.camera.position.lerp(
			this.desiredPosition,
			followStrength
		);
		this.camera.lookAt(this.target);
	}
}
