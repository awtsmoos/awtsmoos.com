// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file TempleWorld.js
 * @description Coordinates the finite generic-native world root, stream, turns, inspection, and delegated chunk-pool construction.
 * The Awtsmoos renews the road while bounded vessels travel from horizon to foreground and back;
 * Awtsmoos.com keeps world coordination simple, while Binah allocates once and Netzach guards the endless track.
 */

import {
	Group
} from "/libs/awtsmoos-procedural-core/src/adapters/native/index.js";
import { TurnGateController } from "./TurnGateController.js";
import { BinahWorldChunkPoolBuilder } from "./WorldChunkPoolBuilder.js";
import { YesodWorldChunkStream } from "./WorldChunkStream.js";
import { NetzachWorldTurnOrchestrator } from "./WorldTurnOrchestrator.js";
import { MalchusWorldInspector } from "./WorldInspector.js";

export class TempleWorld {
	/** @param {object} dependencies Scene, state, factories, books, and optional turn callback. */
	constructor(dependencies) {
		Object.assign(this, dependencies);
		this.root = new Group();
		this.root.name = "NativeEndlessTempleWorld";
		this.chunks = [];
		this.poolBuilder = new BinahWorldChunkPoolBuilder();
		this.inspector = new MalchusWorldInspector(
			this.chunks,
			this.root
		);
		this.turnController = this.createTurnController();
		this.stream = new YesodWorldChunkStream(
			this.chunks,
			(chunk) => this.turns.recycle(chunk)
		);
		this.turns = new NetzachWorldTurnOrchestrator({
			chunks: this.chunks,
			stream: this.stream,
			turnController: this.turnController,
			onTurn: (direction) => this.onTurn?.(direction)
		});
	}

	/** @returns {TurnGateController} Reusable visible-corner controller. */
	createTurnController() {
		return new TurnGateController({
			root: this.root,
			state: this.state,
			meshFactory: this.meshFactory,
			onTurn: (direction) => this.turns.resolveTurn(direction)
		});
	}

	/** Creates the finite chunk pool once and attaches the world to the native scene. */
	create() {
		this.scene.add(this.root);
		this.poolBuilder.populate(this);
		this.reset();
		return this;
	}

	/** Restores the bounded world and first tutorial corner. */
	reset() {
		this.turns.reset();
	}

	/** @param {number} delta Active-frame seconds. @param {number} speed Stream speed. */
	update(delta, speed) {
		this.stream.update(delta, speed);
		this.turnController.update(delta, speed);
		this.turns.ensureFutureTurn();
	}

	/** @param {object} command Normalized frame command. @returns {object} Turn-filtered command. */
	consumeDirection(command) {
		return this.turnController.consumeDirection(command);
	}

	/** @param {string} direction Opens an immediate diagnostic corner. */
	forceTurnWindow(direction = "left") {
		this.turnController.forceWindow(direction);
	}

	/** @returns {string|null} Current required corner direction. */
	turnPrompt() {
		return this.turnController.prompt();
	}

	/** @returns {boolean} Whether collision should yield to corner choice. */
	turnProtected() {
		return this.turnController.protectedWindow();
	}

	/** @returns {string} Current district label. */
	currentDistrict() {
		return this.inspector.currentDistrict();
	}

	/** @param {Function} callback Active obstacle visitor. */
	forEachObstacle(callback) {
		this.inspector.forEachObstacle(callback);
	}

	/** @param {Function} callback Active peruta visitor. */
	forEachCollectible(callback) {
		this.inspector.forEachCollectible(callback);
	}

	/** @param {Function} callback Active power-up visitor. */
	forEachPowerUp(callback) {
		this.inspector.forEachPowerUp(callback);
	}

	/** @returns {number} Procedural-mesh evidence count. */
	countProceduralMeshes() {
		return this.inspector.countProceduralMeshes();
	}
}
