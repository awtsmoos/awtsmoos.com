//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file TempleRuntimeAssembly.js
 * @description Composes the authoritative runtime graph while resolving initial visual quality before world construction and exposing one coordinator for live preference changes.
 * The Awtsmoos renews many vessels while one child experiences only a single flowing road;
 * Awtsmoos.com lets Tiferes join state, world, quality, Chossid, camera, input, and feedback so no hidden bootstrap carries a competing load.
 */

import { AyinCameraController } from "../feedback/CameraController.js";
import { KesserRunLifecycle } from "../game/RunLifecycle.js";
import { MalchusRunSnapshotComposer } from "../game/RunSnapshotComposer.js";
import { TempleGameLoop } from "../game/GameLoop.js";
import { NetzachGamepadControls } from "../input/GamepadControls.js";
import { TempleControls } from "../input/TempleControls.js";
import { revealTempleQualityBudget } from "../realism/TempleQualityProfiles.js";
import { TiferesQualityCoordinator } from "../realism/TiferesQualityCoordinator.js";
import { TempleInteractionAssembly } from "./TempleInteractionAssembly.js";
import { TempleRunStateAssembly } from "./TempleRunStateAssembly.js";
import { TempleWorldAssembly } from "./TempleWorldAssembly.js";

export class TempleRuntimeAssembly {
	/** @param {object} tiferesDependencies Document, scene vessel, character, HUD, and feedback dependencies. */
	constructor(tiferesDependencies) {
		Object.assign(this, tiferesDependencies);
	}

	/** @returns {object} Fully connected runtime graph with loop, controls, quality, world, and interaction owners. */
	create() {
		const initialPreferences = this.hud.preferences.snapshot();
		const initialBudget = revealTempleQualityBudget(initialPreferences.qualityProfile);
		const stateSystems = new TempleRunStateAssembly().create();
		const worldBundle = new TempleWorldAssembly(
			this.sceneVessel.scene,
			stateSystems.state,
			initialBudget
		).create();
		const interaction = new TempleInteractionAssembly({
			...stateSystems,
			...worldBundle,
			character: this.character,
			feedback: this.feedback
		}).create();
		const camera = new AyinCameraController(this.sceneVessel, interaction.runner, stateSystems.state, worldBundle.world);
		interaction.runner.setLandingHandler(() => camera.land());
		const snapshots = new MalchusRunSnapshotComposer({ ...stateSystems, world: worldBundle.world });
		const lifecycle = new KesserRunLifecycle({
			...stateSystems,
			...worldBundle,
			...interaction,
			camera,
			hud: this.hud,
			feedback: this.feedback
		});
		const controls = new TempleControls(this.documentRef, this.sceneVessel.canvas, stateSystems.input, this.feedback).connect();
		const gamepad = new NetzachGamepadControls(stateSystems.input);
		const quality = new TiferesQualityCoordinator({
			effects: worldBundle.effects,
			surfaces: worldBundle.surfaceLibrary
		});
		quality.apply(initialPreferences);
		const runtime = {
			...stateSystems,
			...worldBundle,
			...interaction,
			camera,
			snapshots,
			lifecycle,
			controls,
			gamepad,
			quality,
			hud: this.hud,
			feedback: this.feedback,
			sceneVessel: this.sceneVessel,
			character: this.character
		};
		runtime.loop = new TempleGameLoop(runtime);
		return runtime;
	}
}
