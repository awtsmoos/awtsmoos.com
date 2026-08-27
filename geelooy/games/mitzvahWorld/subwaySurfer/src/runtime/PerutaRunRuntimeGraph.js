//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PerutaRunRuntimeGraph.js
 * @description Composes the procedural world, authoritative gameplay runtime, and frozen public API after scene, surfaces, lighting, and authored character already exist.
 * The Awtsmoos renews world, intention, collision, evidence, and public covenant before one hidden runtime may call itself alive;
 * Awtsmoos.com lets Tiferes join those prepared vessels without forcing the asset-loading gate to carry every responsibility inside.
 */

import { KesserPerutaRunApi } from "../api/PerutaRunApi.js";
import { YesodProceduralMeshFactory } from "../core/ProceduralMeshFactory.js";
import { ChaiGameRuntimeFactory } from "./GameRuntimeFactory.js";
import { OlamWorldRuntimeFactory } from "./WorldRuntimeFactory.js";

export class TiferesPerutaRuntimeGraph {
	/**
	 * @description Captures the stable browser/UI/event collaborators shared by world, gameplay runtime, and public API composition.
	 * @param {object} tiferesThree Canonical Three namespace already used by the scene/model layer.
	 * @param {Document} malchusDocument Browser document owning input controls.
	 * @param {object} hodHud HUD presenter receiving gameplay state and collision feedback.
	 * @param {object} yesodEventBus Guarded semantic event bus shared with public consumers.
	 */
	constructor(tiferesThree, malchusDocument, hodHud, yesodEventBus) {
		this.THREE = tiferesThree;
		this.document = malchusDocument;
		this.hud = hodHud;
		this.eventBus = yesodEventBus;
	}

	/**
	 * @description Builds one world, one authoritative gameplay runtime, and one frozen API over the exact same state/input/diagnostic ownership graph.
	 * @param {object} chochmahPrepared Prepared scene/model/material dependencies from the asset boot graph.
	 * @param {object} chochmahPrepared.character Loaded authored Chossid character record.
	 * @param {object} chochmahPrepared.sceneVessel Active scene/renderer/camera vessel.
	 * @param {Readonly<object>} chochmahPrepared.profile Active quality profile.
	 * @param {object} chochmahPrepared.lighting Active bounded lighting rig.
	 * @param {object} chochmahPrepared.surfaceLibrary Shared photographic material library.
	 * @returns {Readonly<object>} Frozen record containing world, runtime, and public API.
	 */
	create(chochmahPrepared) {
		const olamWorld = this.createWorld(chochmahPrepared);
		const chaiRuntime = new ChaiGameRuntimeFactory({
			THREE: this.THREE,
			documentRef: this.document,
			character: chochmahPrepared.character,
			world: olamWorld,
			sceneVessel: chochmahPrepared.sceneVessel,
			profile: chochmahPrepared.profile,
			lighting: chochmahPrepared.lighting,
			surfaceLibrary: chochmahPrepared.surfaceLibrary,
			hud: this.hud,
			eventBus: this.eventBus
		}).create();
		const malchusApi = new KesserPerutaRunApi({
			state: chaiRuntime.state,
			inputIntent: chaiRuntime.inputIntent,
			diagnostics: chaiRuntime.diagnostics,
			eventBus: this.eventBus,
			profile: chochmahPrepared.profile
		});
		return Object.freeze({
			world: olamWorld,
			runtime: chaiRuntime,
			api: malchusApi
		});
	}

	/**
	 * @description Builds the bounded photographic world from the already-shared surface library so every procedural chunk reuses canonical materials and cached image sources.
	 * @param {object} chochmahPrepared Prepared scene/profile/surface dependencies.
	 * @returns {object} Created endless procedural world stream.
	 */
	createWorld(chochmahPrepared) {
		const yesodMeshes = new YesodProceduralMeshFactory(
			this.THREE,
			chochmahPrepared.surfaceLibrary
		);
		return new OlamWorldRuntimeFactory({
			THREE: this.THREE,
			scene: chochmahPrepared.sceneVessel.scene,
			meshFactory: yesodMeshes,
			surfaceLibrary: chochmahPrepared.surfaceLibrary,
			profile: chochmahPrepared.profile
		}).create();
	}
}
