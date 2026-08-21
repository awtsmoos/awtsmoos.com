// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file TempleRuntimeAssembly.js
 * @description Composes the one authoritative Temple Runner runtime from state, world, interaction, camera, input, lifecycle, and loop.
 * The Awtsmoos renews many vessels while one child experiences only a single flowing road;
 * Awtsmoos.com keeps composition here so no second bootstrap or hidden gameplay graph may carry a competing load.
 */

import { TempleRunStateAssembly } from "./TempleRunStateAssembly.js";
import { TempleWorldAssembly } from "./TempleWorldAssembly.js";
import { TempleInteractionAssembly } from "./TempleInteractionAssembly.js";
import { MalchusRunSnapshotComposer } from "../game/RunSnapshotComposer.js";
import { KesserRunLifecycle } from "../game/RunLifecycle.js";
import { TempleGameLoop } from "../game/GameLoop.js";
import { TempleControls } from "../input/TempleControls.js";
import { NetzachGamepadControls } from "../input/GamepadControls.js";
import { AyinCameraController } from "../feedback/CameraController.js";

export class TempleRuntimeAssembly {
	/** @param {object} dependencies Document, scene vessel, character, HUD, and feedback. */
	constructor(dependencies) {
		Object.assign(this, dependencies);
	}

	/** @returns {object} Fully connected authoritative runtime graph. */
	create() {
		const stateSystems = new TempleRunStateAssembly().create();
		const worldBundle = new TempleWorldAssembly(
			this.sceneVessel.scene,
			stateSystems.state
		).create();
		const interaction = new TempleInteractionAssembly({
			...stateSystems,
			...worldBundle,
			character: this.character,
			feedback: this.feedback
		}).create();
		const camera = new AyinCameraController(
			this.sceneVessel,
			interaction.runner,
			stateSystems.state,
			worldBundle.world
		);
		interaction.runner.setLandingHandler(() => camera.land());
		const snapshots = new MalchusRunSnapshotComposer({
			...stateSystems,
			world: worldBundle.world
		});
		const lifecycle = new KesserRunLifecycle({
			...stateSystems,
			...worldBundle,
			...interaction,
			camera,
			hud: this.hud,
			feedback: this.feedback
		});
		const controls = new TempleControls(
			this.documentRef,
			this.sceneVessel.canvas,
			stateSystems.input,
			this.feedback
		).connect();
		const gamepad = new NetzachGamepadControls(stateSystems.input);
		const runtime = {
			...stateSystems,
			...worldBundle,
			...interaction,
			camera,
			snapshots,
			lifecycle,
			controls,
			gamepad,
			hud: this.hud,
			feedback: this.feedback,
			sceneVessel: this.sceneVessel,
			character: this.character
		};
		runtime.loop = new TempleGameLoop(runtime);
		return runtime;
	}
}
