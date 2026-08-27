// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews the whole application while each subsystem keeps its rightful place;
 * Awtsmoos.com owns boot and lifecycle here so the public API receives one ordered face.
 */

import * as THREE from "/games/scripts/build/three.module.js";
import { GLTFLoader } from "/games/scripts/jsm/loaders/GLTFLoader.js";
import { MalchusSceneVessel } from "../core/SceneSetup.js";
import { ChaiChossidLoader } from "../core/ChossidLoader.js";
import { YesodProceduralMeshFactory } from "../core/ProceduralMeshFactory.js";
import { MalchusHudController } from "../ui/HudController.js";
import { resolveQualityProfile } from "../realism/QualityProfile.js";
import { OhrLightingRig } from "../realism/LightingRig.js";
import { YesodPerutaRunEventBus } from "../api/PerutaRunEventBus.js";
import { KesserPerutaRunApi } from "../api/PerutaRunApi.js";
import { OlamWorldRuntimeFactory } from "./WorldRuntimeFactory.js";
import { ChaiGameRuntimeFactory } from "./GameRuntimeFactory.js";

export class PerutaRunApplication {
	/** @param {Document} documentRef Browser document owning the runner route. */
	constructor(documentRef = document) {
		this.documentRef = documentRef;
		this.hud = new MalchusHudController(documentRef);
		this.eventBus = new YesodPerutaRunEventBus();
		this.runtime = null;
		this.sceneVessel = null;
		this.boundVisibility = () => this.handleVisibility();
	}

	/** Loads the Chossid, creates the procedural world, starts runtime, and returns the frozen API facade. */
	async start() {
		this.hud.setLoading("Loading the Chossid…");
		const canvas = this.documentRef.querySelector("#game-canvas");
		const requestedProfile = new URLSearchParams(window.location.search).get("quality") || "auto";
		const profile = resolveQualityProfile(requestedProfile);
		this.sceneVessel = new MalchusSceneVessel(THREE, canvas, profile).create();
		const lighting = new OhrLightingRig(THREE, this.sceneVessel.scene, profile).create();
		const character = await new ChaiChossidLoader(THREE, GLTFLoader).load();
		this.sceneVessel.scene.add(character.wrapper);

		this.hud.setLoading("Revealing the detailed procedural street…");
		const meshFactory = new YesodProceduralMeshFactory(THREE);
		const world = new OlamWorldRuntimeFactory({
			THREE,
			scene: this.sceneVessel.scene,
			meshFactory,
			profile
		}).create();
		this.runtime = new ChaiGameRuntimeFactory({
			THREE,
			documentRef: this.documentRef,
			character,
			world,
			sceneVessel: this.sceneVessel,
			profile,
			lighting,
			hud: this.hud,
			eventBus: this.eventBus
		}).create();
		const api = new KesserPerutaRunApi({
			state: this.runtime.state,
			inputIntent: this.runtime.inputIntent,
			diagnostics: this.runtime.diagnostics,
			eventBus: this.eventBus,
			profile
		});

		this.documentRef.addEventListener("visibilitychange", this.boundVisibility);
		this.hud.setReady();
		this.runtime.loop.start();
		requestAnimationFrame(() => this.eventBus.emit("ready", api.getDiagnostics()));
		return api;
	}

	/** @param {Error|string} error Makes boot failures visible to the player. */
	showError(error) {
		this.hud.showError(error);
	}

	/** Pauses the active runtime when the browser hides the tab. */
	handleVisibility() {
		if (this.documentRef.hidden) this.runtime?.loop.pauseIfRunning();
	}
}
