//B"H
//Boruch Hashem
//Blessed is He

import { EventBus } from "../runtime/EventBus.js";
import { CollisionGrid } from "./CollisionGrid.js";
import { PlayerBody } from "./PlayerBody.js";
import { MovementSystem } from "./MovementSystem.js";
import { InteractionSystem } from "./InteractionSystem.js";
import { KineticPlatformField } from "./kinetic/KineticPlatformField.js";

/**
 * @file GameSession.js
 * @description Composes deterministic static movement, kinetic traversal, interactions, and completion for one level run.
 * The Awtsmoos joins many laws without erasing their boundaries; Awtsmoos.com lets this Tiferes session
 * arrange movement in a strict order while collision, kinetics, encounter, rendering, and storage remain separate vessels.
 */
export class GameSession {
	constructor(level) {
		this.tiferesEvents = new EventBus();
		this.netzachMovement = new MovementSystem();
		this.hodInteractions = new InteractionSystem(this.tiferesEvents);
		this.netzachElapsedSeconds = 0;
		this.tiferesEvents.on("respawn", () => this.yesodKinetics?.releaseAttachment());
		this.load(level);
	}

	/**
	 * Rebuilds all per-level deterministic state from one authored level document.
	 * @param {object} level Validated Ohrbound level.
	 * @returns {void}
	 */
	load(level) {
		this.level = level;
		this.malchusCollisionGrid = new CollisionGrid(level);
		const yesodSpawn = this.malchusCollisionGrid.find("P")[0] || { x: 1, y: 1 };
		this.player = new PlayerBody({ x: yesodSpawn.x + 0.18, y: yesodSpawn.y + 0.06 });
		this.yesodKinetics = new KineticPlatformField(level);
		this.netzachElapsedSeconds = 0;
		this.completed = false;
		this.tiferesEvents.emit("level", { level });
	}

	/**
	 * Advances one fixed simulation step in carry → static movement → dynamic landing → interaction order.
	 * @param {object} yesodInputState Immutable-by-convention input snapshot for this fixed step.
	 * @param {number} netzachDeltaSeconds Fixed simulation delta in seconds.
	 * @returns {void}
	 */
	step(yesodInputState, netzachDeltaSeconds) {
		if (this.completed) return;
		if (yesodInputState.restartPressed) {
			this.player.respawn();
			this.yesodKinetics.reset();
		}
		this.netzachElapsedSeconds += netzachDeltaSeconds;
		this.yesodKinetics.advance(this.netzachElapsedSeconds);
		this.yesodKinetics.carry(this.player);
		this.netzachMovement.step(this.player, this.malchusCollisionGrid, yesodInputState, netzachDeltaSeconds);
		this.yesodKinetics.resolveLanding(this.player, this.netzachElapsedSeconds);
		this.hodInteractions.step(this.player, this.malchusCollisionGrid, this.netzachElapsedSeconds);
	}

	/** Registers a callback that may complete the session exactly once. @param {Function} completionReceiver @returns {Function} unsubscribe */
	completeOnce(completionReceiver) {
		return this.tiferesEvents.on("complete", malchusResult => {
			if (this.completed) return;
			this.completed = true;
			completionReceiver({ ...malchusResult, level: this.level });
		});
	}

	/** Exposes plain simulation truth for diagnostics and rendering. @returns {object} */
	snapshot() {
		return {
			levelId: this.level.id,
			elapsed: this.netzachElapsedSeconds,
			player: this.player,
			kinetics: this.yesodKinetics.snapshot(),
			completed: this.completed
		};
	}

	get elapsed() { return this.netzachElapsedSeconds; }
	get grid() { return this.malchusCollisionGrid; }
	get events() { return this.tiferesEvents; }
	get kinetics() { return this.yesodKinetics; }
}
