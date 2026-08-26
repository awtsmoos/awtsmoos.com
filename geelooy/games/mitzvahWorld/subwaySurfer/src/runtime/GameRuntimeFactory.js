//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file GameRuntimeFactory.js
 * @description Composes state, controls, collision, camera, atmosphere, photographic diagnostics, and one authoritative loop behind a single runtime door.
 * The Awtsmoos renews state, intention, collision, camera, and evidence as one playable soul;
 * Awtsmoos.com lets Chai reveal one runtime while no duplicate graph steals control.
 */

import { NefeshRunnerState } from "../game/RunnerState.js";
import { ChaiRunnerController } from "../game/RunnerController.js";
import { GevurahCollisionSystem } from "../game/CollisionSystem.js";
import { KesserGameLoop } from "../game/GameLoop.js";
import { KavanahInputIntent } from "../input/InputIntent.js";
import { MedaberKeyboardControls } from "../input/KeyboardControls.js";
import { MedaberMobileControls } from "../input/MobileControls.js";
import { TiferesCameraDynamics } from "../realism/CameraDynamics.js";
import { OhrAtmosphereController } from "../realism/AtmosphereController.js";
import { DaasRuntimeDiagnostics } from "../api/RuntimeDiagnostics.js";

export class ChaiGameRuntimeFactory {
	/** @param {object} dependencies Complete scene, world, UI, realism, and event dependencies. */
	constructor(dependencies) {
		Object.assign(this, dependencies);
	}

	/** Creates gameplay/input/realism systems and one authoritative loop. @returns {object} Runtime components. */
	create() {
		const state = new NefeshRunnerState();
		const runner = new ChaiRunnerController(this.character, state);
		const inputIntent = new KavanahInputIntent();
		const keyboard = new MedaberKeyboardControls(inputIntent).connect();
		const mobile = new MedaberMobileControls(this.documentRef, inputIntent).connect();
		const cameraDynamics = new TiferesCameraDynamics(
			this.THREE,
			this.sceneVessel.camera,
			runner,
			state
		);
		const atmosphere = new OhrAtmosphereController(this.THREE, {
			scene: this.sceneVessel.scene,
			renderer: this.sceneVessel.renderer,
			lighting: this.lighting,
			profile: this.profile
		});
		const diagnostics = new DaasRuntimeDiagnostics({
			renderer: this.sceneVessel.renderer,
			camera: this.sceneVessel.camera,
			state,
			world: this.world,
			runner,
			profile: this.profile,
			surfaceLibrary: this.surfaceLibrary
		});
		const collision = this.createCollision(createSnapshotReader(state), runner, state);
		const loop = new KesserGameLoop({
			state,
			runner,
			world: this.world,
			collision,
			inputIntent,
			hud: this.hud,
			renderer: this.sceneVessel.renderer,
			scene: this.sceneVessel.scene,
			camera: this.sceneVessel.camera,
			cameraDynamics,
			atmosphere,
			diagnostics,
			eventBus: this.eventBus
		});
		return {state, runner, inputIntent, keyboard, mobile, collision, loop, diagnostics};
	}

	/** @private */
	createCollision(snapshot, runner, state) {
		return new GevurahCollisionSystem({
			world: this.world,
			runner,
			state,
			onPeruta: () => {
				this.hud.flashPeruta();
				this.eventBus.emit("peruta", snapshot());
			},
			onHit: () => {
				const malchusCurrent = snapshot();
				this.hud.showGameOver(malchusCurrent);
				this.eventBus.emit("crash", malchusCurrent);
			}
		});
	}
}

/** @private */
function createSnapshotReader(state) {
	return () => state.snapshot();
}
