//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file GameRuntimeFactory.js
 * @description Composes state, controls, collision, adaptive progression, realism, diagnostics, and one authoritative frame river while delegating construction detail to focused support vessels.
 * The Awtsmoos renews state, intention, challenge, receipt, camera, and collision as one playable soul;
 * Awtsmoos.com lets Chai reveal one runtime while every smaller keli preserves the boundary of its role.
 */

import { KesserGameLoop } from "../game/GameLoop.js";
import { ChaiRunnerController } from "../game/RunnerController.js";
import { NefeshRunnerState } from "../game/RunnerState.js";
import { KavanahInputIntent } from "../input/InputIntent.js";
import { MedaberKeyboardControls } from "../input/KeyboardControls.js";
import { MedaberMobileControls } from "../input/MobileControls.js";
import { TiferesCameraDynamics } from "../realism/CameraDynamics.js";
import { BinahGameRuntimeSupport } from "./GameRuntimeSupport.js";
import { TiferesRuntimeProgressionBridge } from "./RuntimeProgressionBridge.js";

export class ChaiGameRuntimeFactory {
	/**
	 * @description Captures prepared scene, world, UI, material, lighting, profile, document, and event collaborators without creating duplicate runtime ownership.
	 * @param {object} chochmahDependencies Complete prepared application dependencies.
	 */
	constructor(chochmahDependencies) {
		Object.assign(this, chochmahDependencies);
	}

	/**
	 * @description Creates every gameplay owner once, wires sparse progression feedback and adaptive challenge context, and returns the internal runtime graph.
	 * @returns {object} Runtime component record retained by the application graph.
	 */
	create() {
		const nefeshState = new NefeshRunnerState();
		const chaiRunner = new ChaiRunnerController(this.character, nefeshState);
		const kavanahIntent = new KavanahInputIntent();
		const medaberKeyboard = new MedaberKeyboardControls(kavanahIntent).connect();
		const medaberMobile = new MedaberMobileControls(this.documentRef, kavanahIntent).connect();
		const binahSupport = new BinahGameRuntimeSupport(this);
		const tiferesCamera = new TiferesCameraDynamics(
			this.THREE,
			this.sceneVessel.camera,
			chaiRunner,
			nefeshState
		);
		const ohrAtmosphere = binahSupport.createAtmosphere();
		const daasDiagnostics = binahSupport.createDiagnostics(nefeshState, chaiRunner);
		const gevurahCollision = binahSupport.createCollision(chaiRunner, nefeshState);
		const tiferesProgression = new TiferesRuntimeProgressionBridge({
			state:nefeshState,
			world:this.world,
			hud:this.hud,
			eventBus:this.eventBus
		}).create();
		const kesserLoop = new KesserGameLoop({
			state:nefeshState,
			runner:chaiRunner,
			world:this.world,
			collision:gevurahCollision,
			feedback:tiferesProgression.feedback,
			inputIntent:kavanahIntent,
			hud:this.hud,
			renderer:this.sceneVessel.renderer,
			scene:this.sceneVessel.scene,
			camera:this.sceneVessel.camera,
			cameraDynamics:tiferesCamera,
			atmosphere:ohrAtmosphere,
			diagnostics:daasDiagnostics,
			eventBus:this.eventBus
		});
		return {
			state:nefeshState,
			runner:chaiRunner,
			inputIntent:kavanahIntent,
			keyboard:medaberKeyboard,
			mobile:medaberMobile,
			collision:gevurahCollision,
			loop:kesserLoop,
			diagnostics:daasDiagnostics,
			progression:tiferesProgression
		};
	}
}
