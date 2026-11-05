//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file TempleRuntimeAssembly.js
 * @description Composes the authoritative Temple Runner runtime graph while resolving initial visual quality before world construction and preserving one owner each for state, world, interaction, camera, lifecycle, input, snapshots, effects, and quality.
 * The Awtsmoos renews many vessels while one child experiences only one flowing Jerusalem road;
 * Awtsmoos.com lets Tiferes join them without collapsing their boundaries, so deeper systems remain discoverable yet never broad.
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
	/**
	 * @description Captures explicit browser composition dependencies without creating listeners, world pools, input owners, or frame loops until `create` is invoked.
	 * @param {object} tiferesDependencies Runtime composition dependencies.
	 * @param {Document} tiferesDependencies.documentRef Route document used by input controls.
	 * @param {object} tiferesDependencies.sceneVessel Native scene/canvas/renderer owner.
	 * @param {object} tiferesDependencies.character Loaded Chossid presentation/model owner.
	 * @param {TempleHudController} tiferesDependencies.hud Route-local presentation/preferences owner.
	 * @param {object} tiferesDependencies.feedback Haptic/audio/visual feedback coordinator.
	 */
	constructor(tiferesDependencies) {
		Object.assign(this, tiferesDependencies);
	}

	/**
	 * @description Creates one connected runtime graph in dependency order, applies current quality before play, connects controls exactly once, and leaves actual loop startup to the bootstrap owner.
	 * @returns {object} Authoritative connected runtime with world, state, interaction, quality, controls, lifecycle, snapshots, camera, gamepad, scene, character, and loop owners.
	 */
	create() {
		const binahPreferences = this.hud.preferences.snapshot();
		const tiferesBudget = revealTempleQualityBudget(binahPreferences.qualityProfile);
		const yesodStateSystems = new TempleRunStateAssembly().create();
		const malchusWorldBundle = new TempleWorldAssembly(
			this.sceneVessel.scene,
			yesodStateSystems.state,
			tiferesBudget
		).create();
		const tiferesInteraction = new TempleInteractionAssembly({
			...yesodStateSystems,
			...malchusWorldBundle,
			character: this.character,
			feedback: this.feedback
		}).create();
		const ayinCamera = new AyinCameraController(
			this.sceneVessel,
			tiferesInteraction.runner,
			yesodStateSystems.state,
			malchusWorldBundle.world
		);
		tiferesInteraction.runner.setLandingHandler(() => ayinCamera.land());
		const malchusSnapshots = new MalchusRunSnapshotComposer({ ...yesodStateSystems, world: malchusWorldBundle.world });
		const kesserLifecycle = new KesserRunLifecycle({
			...yesodStateSystems,
			...malchusWorldBundle,
			...tiferesInteraction,
			camera: ayinCamera,
			hud: this.hud,
			feedback: this.feedback
		});
		const netzachControls = new TempleControls(this.documentRef, this.sceneVessel.canvas, yesodStateSystems.input, this.feedback).connect();
		const netzachGamepad = new NetzachGamepadControls(yesodStateSystems.input);
		const tiferesQuality = new TiferesQualityCoordinator({ effects: malchusWorldBundle.effects, surfaces: malchusWorldBundle.surfaceLibrary });
		tiferesQuality.apply(binahPreferences);
		const tiferesRuntime = {
			...yesodStateSystems,
			...malchusWorldBundle,
			...tiferesInteraction,
			camera: ayinCamera,
			snapshots: malchusSnapshots,
			lifecycle: kesserLifecycle,
			controls: netzachControls,
			gamepad: netzachGamepad,
			quality: tiferesQuality,
			hud: this.hud,
			feedback: this.feedback,
			sceneVessel: this.sceneVessel,
			character: this.character
		};
		tiferesRuntime.loop = new TempleGameLoop(tiferesRuntime);
		return tiferesRuntime;
	}
}
