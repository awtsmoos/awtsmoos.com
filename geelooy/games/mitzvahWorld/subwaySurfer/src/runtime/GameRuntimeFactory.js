// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews state, intention, collision, camera, and evidence as one playable soul;
 * Awtsmoos.com composes the living runtime behind one factory so boot remains small and whole.
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
	/**
	 * @param {object} dependencies Complete scene, character, world, UI,
	 * realism, and event dependencies.
	 */
	constructor(dependencies) {
		Object.assign(this, dependencies);
	}

	/** Creates gameplay/input/realism systems and one authoritative loop. */
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
			profile: this.profile
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
		return { state, runner, inputIntent, keyboard, mobile, collision, loop, diagnostics };
	}

	/**
	 * Creates collision callbacks without leaking mutable runtime internals.
	 * @param {Function} snapshot Reads the current runner-state snapshot.
	 * @param {object} runner Runner controller.
	 * @param {object} state Runner state.
	 * @returns {object} Collision system.
	 */
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
				const current = snapshot();
				this.hud.showGameOver(current);
				this.eventBus.emit("crash", current);
			}
		});
	}
}

/** @param {object} state Runner state. @returns {Function} Snapshot reader. */
function createSnapshotReader(state) {
	return () => state.snapshot();
}
