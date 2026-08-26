//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PerutaRunApplication.js
 * @description Boots the authored Chossid, cached photographic surfaces, budgeted advanced street, authoritative runtime, and frozen API without blocking on texture hydration.
 * The Awtsmoos renews model, texture, branch, obstacle, and command before one run can start;
 * Awtsmoos.com lets cached imagery arrive progressively while stable gameplay owns the heart.
 */

import * as THREE from "/games/scripts/build/three.module.js";
import { GLTFLoader } from "/games/scripts/jsm/loaders/GLTFLoader.js";
import { MalchusSceneVessel } from "../core/SceneSetup.js";
import { ChaiChossidLoader } from "../core/ChossidLoader.js";
import { YesodProceduralMeshFactory } from "../core/ProceduralMeshFactory.js";
import { MalchusHudController } from "../ui/HudController.js";
import { resolveQualityProfile } from "../realism/QualityProfile.js";
import { OhrLightingRig } from "../realism/LightingRig.js";
import { YesodPerutaPhotographicSurfaceLibrary } from "../realism/PerutaPhotographicSurfaceLibrary.js";
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
		this.surfaceLibrary = null;
		this.boundVisibility = () => this.handleVisibility();
	}

	/** Loads required runtime assets, starts immediately on fallbacks, and returns the frozen public API. */
	async start() {
		this.hud.setLoading("Loading the Chossid…");
		const malchusCanvas = this.documentRef.querySelector("#game-canvas");
		const chochmahProfileName = new URLSearchParams(window.location.search).get("quality") || "auto";
		const tiferesProfile = resolveQualityProfile(chochmahProfileName);
		this.sceneVessel = new MalchusSceneVessel(THREE, malchusCanvas, tiferesProfile).create();
		const ohrLighting = new OhrLightingRig(THREE, this.sceneVessel.scene, tiferesProfile).create();
		this.surfaceLibrary = new YesodPerutaPhotographicSurfaceLibrary(
			THREE,
			this.sceneVessel.renderer
		);
		const chaiCharacter = await new ChaiChossidLoader(THREE, GLTFLoader).load();
		this.sceneVessel.scene.add(chaiCharacter.wrapper);
		this.hud.setLoading("Revealing the stable textured old-city road…");
		const yesodMeshFactory = new YesodProceduralMeshFactory(THREE, this.surfaceLibrary);
		const olamWorld = new OlamWorldRuntimeFactory({
			THREE,
			scene: this.sceneVessel.scene,
			meshFactory: yesodMeshFactory,
			surfaceLibrary: this.surfaceLibrary,
			profile: tiferesProfile
		}).create();
		this.runtime = new ChaiGameRuntimeFactory({
			THREE,
			documentRef: this.documentRef,
			character: chaiCharacter,
			world: olamWorld,
			sceneVessel: this.sceneVessel,
			profile: tiferesProfile,
			lighting: ohrLighting,
			surfaceLibrary: this.surfaceLibrary,
			hud: this.hud,
			eventBus: this.eventBus
		}).create();
		const malchusApi = new KesserPerutaRunApi({
			state: this.runtime.state,
			inputIntent: this.runtime.inputIntent,
			diagnostics: this.runtime.diagnostics,
			eventBus: this.eventBus,
			profile: tiferesProfile
		});
		this.documentRef.addEventListener("visibilitychange", this.boundVisibility);
		this.hud.setReady();
		this.runtime.loop.start();
		requestAnimationFrame(() => this.eventBus.emit("ready", malchusApi.getDiagnostics()));
		return malchusApi;
	}

	/** @param {Error|string} error Makes boot failures visible to the player. */
	showError(error) {
		this.hud.showError(error);
	}

	/** Pauses active runtime when the browser hides the tab. */
	handleVisibility() {
		if (this.documentRef.hidden) this.runtime?.loop.pauseIfRunning();
	}
}
