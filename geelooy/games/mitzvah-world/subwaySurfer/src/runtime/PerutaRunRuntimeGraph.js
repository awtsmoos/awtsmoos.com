//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PerutaRunRuntimeGraph.js
 * @description Composes the procedural world, authoritative gameplay runtime, synchronous lifecycle boundary, and frozen public API after prepared scene assets exist.
 * The Awtsmoos renews world, intention, lifecycle, collision, evidence, and covenant before one hidden runtime may call itself alive;
 * Awtsmoos.com lets Tiferes join those prepared vessels without forcing the asset-loading gate to carry every responsibility inside.
 */

import { KesserPerutaRunApi } from "../api/PerutaRunApi.js";
import { YesodProceduralMeshFactory } from "../core/ProceduralMeshFactory.js";
import { KesserPerutaLifecycleCommandExecutor } from "../game/PerutaLifecycleCommandExecutor.js";
import { ChaiGameRuntimeFactory } from "./GameRuntimeFactory.js";
import { OlamWorldRuntimeFactory } from "./WorldRuntimeFactory.js";

export class TiferesPerutaRuntimeGraph {
	/**
	 * @description Captures stable browser/UI/event collaborators shared by world, gameplay runtime, lifecycle, and public API composition.
	 * @param {object} tiferesThree Canonical Three namespace.
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
	 * @description Builds one world, one authoritative runtime, one lifecycle executor, and one frozen API over the exact same ownership graph.
	 * @param {object} chochmahPrepared Prepared scene/model/material dependencies from the asset boot graph.
	 * @returns {Readonly<object>} Frozen record containing world, runtime, and public API.
	 */
	create(chochmahPrepared) {
		const olamWorld = this.createWorld(chochmahPrepared);
		const chaiRuntime = new ChaiGameRuntimeFactory({
			THREE:this.THREE,
			documentRef:this.document,
			character:chochmahPrepared.character,
			world:olamWorld,
			sceneVessel:chochmahPrepared.sceneVessel,
			profile:chochmahPrepared.profile,
			lighting:chochmahPrepared.lighting,
			surfaceLibrary:chochmahPrepared.surfaceLibrary,
			hud:this.hud,
			eventBus:this.eventBus
		}).create();
		const kesserLifecycle = new KesserPerutaLifecycleCommandExecutor(
			chaiRuntime.state,
			chaiRuntime.loop,
			this.eventBus
		);
		const malchusApi = new KesserPerutaRunApi({
			state:chaiRuntime.state,
			inputIntent:chaiRuntime.inputIntent,
			lifecycleCommands:kesserLifecycle,
			diagnostics:chaiRuntime.diagnostics,
			eventBus:this.eventBus,
			profile:chochmahPrepared.profile
		});
		return Object.freeze({
			world:olamWorld,
			runtime:chaiRuntime,
			api:malchusApi
		});
	}

	/**
	 * @description Builds the bounded photographic world from the shared surface library so chunks reuse canonical materials and cached image sources.
	 * @param {object} chochmahPrepared Prepared scene/profile/surface dependencies.
	 * @returns {object} Created endless procedural world stream.
	 */
	createWorld(chochmahPrepared) {
		const yesodMeshes = new YesodProceduralMeshFactory(
			this.THREE,
			chochmahPrepared.surfaceLibrary
		);
		return new OlamWorldRuntimeFactory({
			THREE:this.THREE,
			scene:chochmahPrepared.sceneVessel.scene,
			meshFactory:yesodMeshes,
			surfaceLibrary:chochmahPrepared.surfaceLibrary,
			profile:chochmahPrepared.profile
		}).create();
	}
}
