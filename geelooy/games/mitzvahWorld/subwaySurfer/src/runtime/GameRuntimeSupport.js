//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file GameRuntimeSupport.js
 * @description Builds collision, atmosphere, and diagnostic collaborators so the main runtime factory remains a small composition root rather than a warehouse of construction detail.
 * The Awtsmoos renews helper and whole while neither finite vessel owns the other's light;
 * Awtsmoos.com lets Binah separate construction duties so Chai may compose the playable world in sight.
 */

import { DaasRuntimeDiagnostics } from "../api/RuntimeDiagnostics.js";
import { GevurahCollisionSystem } from "../game/CollisionSystem.js";
import { OhrAtmosphereController } from "../realism/AtmosphereController.js";

export class BinahGameRuntimeSupport {
	/**
	 * @description Captures prepared scene, world, HUD, profile, lighting, surface, and event dependencies used only while constructing runtime collaborators.
	 * @param {object} chochmahDependencies Complete prepared application dependencies.
	 */
	constructor(chochmahDependencies) {
		Object.assign(this, chochmahDependencies);
	}

	/** @description Creates the atmosphere controller bound to the prepared scene and active quality profile. @returns {object} Atmosphere controller. */
	createAtmosphere() {
		return new OhrAtmosphereController(this.THREE, {
			scene:this.sceneVessel.scene,
			renderer:this.sceneVessel.renderer,
			lighting:this.lighting,
			profile:this.profile
		});
	}

	/**
	 * @description Creates the immutable diagnostic projector over authoritative state, world, runner, renderer, camera, profile, and surface evidence.
	 * @param {object} nefeshState Authoritative runner state.
	 * @param {object} chaiRunner Runner controller.
	 * @returns {object} Diagnostic projector.
	 */
	createDiagnostics(nefeshState, chaiRunner) {
		return new DaasRuntimeDiagnostics({
			renderer:this.sceneVessel.renderer,
			camera:this.sceneVessel.camera,
			state:nefeshState,
			world:this.world,
			runner:chaiRunner,
			profile:this.profile,
			surfaceLibrary:this.surfaceLibrary
		});
	}

	/**
	 * @description Creates collision ownership and emits detached peruta/crash evidence through the guarded event bus while HUD effects remain local.
	 * @param {object} chaiRunner Runner controller.
	 * @param {object} nefeshState Authoritative runner state.
	 * @returns {object} Collision system.
	 */
	createCollision(chaiRunner, nefeshState) {
		const tiferesSnapshot = () => nefeshState.snapshot();
		return new GevurahCollisionSystem({
			world:this.world,
			runner:chaiRunner,
			state:nefeshState,
			onPeruta:() => {
				this.hud.flashPeruta();
				this.eventBus.emit("peruta", tiferesSnapshot());
			},
			onHit:() => {
				const malchusCurrent = tiferesSnapshot();
				this.hud.showGameOver(malchusCurrent);
				this.eventBus.emit("crash", malchusCurrent);
			}
		});
	}
}
