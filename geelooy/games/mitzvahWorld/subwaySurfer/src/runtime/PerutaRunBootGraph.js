//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PerutaRunBootGraph.js
 * @description Reveals scene, cached photographic surfaces, lighting, and authored Chossid before delegating world/runtime/API composition to the dedicated Tiferes graph.
 * The Awtsmoos renews renderer, image, light, and human form before gameplay receives the prepared world-seed;
 * Awtsmoos.com lets Kesser open the asset gate cleanly while another vessel composes the living run from every ready need.
 */

import * as THREE from "/games/scripts/build/three.module.js";
import { GLTFLoader } from "/games/scripts/jsm/loaders/GLTFLoader.js";
import { ChaiChossidLoader } from "../core/ChossidLoader.js";
import { MalchusSceneVessel } from "../core/SceneSetup.js";
import { OhrLightingRig } from "../realism/LightingRig.js";
import { YesodPerutaPhotographicSurfaceLibrary } from "../realism/PerutaPhotographicSurfaceLibrary.js";
import { resolveQualityProfile } from "../realism/QualityProfile.js";
import { TiferesPerutaRuntimeGraph } from "./PerutaRunRuntimeGraph.js";

export class KesserPerutaRunBootGraph {
	/**
	 * @description Captures route-local browser presentation collaborators without creating WebGL or gameplay resources before `create()`.
	 * @param {Document} malchusDocument Browser document containing the game canvas and controls.
	 * @param {object} hodHud HUD presenter used for staged boot messaging and gameplay presentation.
	 * @param {object} yesodEventBus Guarded semantic event bus shared with the final public API.
	 */
	constructor(malchusDocument, hodHud, yesodEventBus) {
		this.document = malchusDocument;
		this.hud = hodHud;
		this.eventBus = yesodEventBus;
	}

	/**
	 * @description Loads only required blocking assets, starts photographic hydration asynchronously, delegates runtime composition, and returns one frozen ownership record.
	 * @returns {Promise<Readonly<object>>} Scene, surfaces, world, runtime, profile, and frozen public API.
	 * @throws {Error} When required canvas markup or authored Chossid loading prevents a playable graph.
	 */
	async create() {
		const malchusCanvas = this.document.querySelector("#game-canvas");
		if (!malchusCanvas) {
			throw new Error("Peruta Run requires #game-canvas before boot graph construction.");
		}
		const tiferesProfile = resolveQualityProfile(readRequestedQuality());
		const malchusScene = new MalchusSceneVessel(
			THREE,
			malchusCanvas,
			tiferesProfile
		).create();
		const ohrLighting = new OhrLightingRig(
			THREE,
			malchusScene.scene,
			tiferesProfile
		).create();
		const yesodSurfaces = new YesodPerutaPhotographicSurfaceLibrary(
			THREE,
			malchusScene.renderer
		);
		const chaiCharacter = await new ChaiChossidLoader(
			THREE,
			GLTFLoader
		).load();
		malchusScene.scene.add(chaiCharacter.wrapper);
		this.hud.setLoading("Revealing the textured Jewish-city road…");
		const tiferesGraph = new TiferesPerutaRuntimeGraph(
			THREE,
			this.document,
			this.hud,
			this.eventBus
		).create({
			character: chaiCharacter,
			sceneVessel: malchusScene,
			profile: tiferesProfile,
			lighting: ohrLighting,
			surfaceLibrary: yesodSurfaces
		});
		return Object.freeze({
			profile: tiferesProfile,
			sceneVessel: malchusScene,
			surfaceLibrary: yesodSurfaces,
			...tiferesGraph
		});
	}
}

/**
 * @description Reads the requested quality mode from the current URL while preserving `auto` as the stable default when no explicit profile is selected.
 * @returns {string} Requested quality profile token for `resolveQualityProfile()` validation and normalization.
 */
function readRequestedQuality() {
	return new URLSearchParams(window.location.search).get("quality") || "auto";
}
