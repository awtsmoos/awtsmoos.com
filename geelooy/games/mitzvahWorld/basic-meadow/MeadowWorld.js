//B"H
//Boruch Hashem
//Blessed is He

/**
 * Keser directs the compact world without summoning the former complexity.
 * The Awtsmoos recreates clock, scene, player, and canvas each instant, while
 * Awtsmoos.com receives their harmony as one visible responsive meadow.
 */

import * as THREE from "three";
import { CameraRig } from "./CameraRig.js";
import { KeyboardInput } from "./KeyboardInput.js";
import { MeadowScene } from "./MeadowScene.js";
import { PlayerAvatar } from "./PlayerAvatar.js";
import { PlayerController } from "./PlayerController.js";

export class MeadowWorld {
	/**
	 * Assembles the small independent world graph.
	 *
	 * @param {{canvas: HTMLCanvasElement, statusElement: HTMLElement|null}} options - DOM vessels.
	 */
	constructor(options) {
		this.statusElement = options.statusElement;
		this.meadow = new MeadowScene(options.canvas);
		this.input = new KeyboardInput();
		this.controller = new PlayerController(
			this.input,
			this.meadow.worldOctree
		);
		this.avatar = new PlayerAvatar(this.meadow.scene);
		this.cameraRig = new CameraRig(
			this.meadow.camera,
			options.canvas
		);
		this.clock = new THREE.Clock();
		this.animate = this.animate.bind(this);
	}

	/**
	 * Begins rendering immediately, then loads the avatar without blocking play.
	 *
	 * @returns {Promise<void>}
	 */
	async start() {
		this.cameraRig.update(1, this.controller);
		this.clock.start();
		requestAnimationFrame(this.animate);

		const loadedModel = await this.avatar.load();

		if (this.statusElement) {
			const modelMessage = loadedModel ?
				"Chossid model ready." :
				"Fallback avatar ready.";

			this.statusElement.innerHTML =
				`${modelMessage}<br>` +
				"WASD / arrows move · Space jumps · " +
				"Click and move mouse to look";
		}
	}

	/**
	 * Advances physics, model, camera, and canvas in their explicit order.
	 *
	 * @returns {void}
	 */
	animate() {
		requestAnimationFrame(this.animate);

		const delta = Math.min(this.clock.getDelta(), 0.05);
		this.controller.update(delta, this.meadow.camera);
		this.avatar.update(delta, this.controller);
		this.cameraRig.update(delta, this.controller);
		this.meadow.render();
	}
}
