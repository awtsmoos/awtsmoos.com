// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file TurnGateController.js
 * @description Owns visible corner approach, signed decision, branch lifetime, and smooth visual turn strength.
 * The Awtsmoos renews each corner before left or right can become a chosen way;
 * Awtsmoos.com lets one lane gesture become a turn only where the stone gate clearly says.
 */

import {
	OLAM_CONFIG,
	TURN_CONFIG
} from "../config.js";
import { TurnGateFactory } from "./TurnGateFactory.js";
import { NetzachTurnRoadFactory } from "./TurnRoadFactory.js";

export class TurnGateController {
	/** @param {object} dependencies Root, state, mesh factory, and turn callback. */
	constructor(dependencies) {
		this.root = dependencies.root;
		this.state = dependencies.state;
		this.onTurn = dependencies.onTurn || (() => {});
		this.gate = new TurnGateFactory(dependencies.meshFactory).create();
		this.roadFactory = new NetzachTurnRoadFactory(dependencies.meshFactory);
		this.road = this.roadFactory.create();
		this.root.add(this.gate, this.road);
		this.reset();
	}

	/** Restores the first left corner and clears turn presentation. */
	reset() {
		this.direction = "left";
		this.lastDirection = "left";
		this.turnCount = 0;
		this.turnTime = 0;
		this.spawn("left", OLAM_CONFIG.turnSpawnZ);
	}

	/** @param {number} delta Active-frame seconds. @param {number} speed Stream speed. */
	update(delta, speed) {
		if (this.gate.visible) {
			this.gate.position.z += speed * delta;
			this.road.position.z = this.gate.position.z;
			if (this.gate.position.z > OLAM_CONFIG.turnWindowFar) {
				this.state.gameOver(`Missed the ${this.direction} turn.`);
			}
		}
		this.turnTime = Math.max(0, this.turnTime - delta);
		if (!this.turnTime && !this.gate.visible) {
			this.road.visible = false;
		}
	}

	/** @param {object} command Normalized input. @returns {object} Command after optional turn consumption. */
	consumeDirection(command) {
		if (!this.prompt() || !command.laneDelta) return command;
		const attempted = command.laneDelta < 0 ? "left" : "right";
		const filtered = { ...command, laneDelta: 0 };
		if (attempted !== this.direction) {
			this.state.gameOver(
				`Turned ${attempted}; the path turned ${this.direction}.`
			);
			return filtered;
		}
		this.resolve(attempted);
		return filtered;
	}

	/** @returns {string|null} Required direction while the corner input window is active. */
	prompt() {
		if (!this.gate.visible) return null;
		const z = this.gate.position.z;
		return z >= OLAM_CONFIG.turnWindowNear && z <= OLAM_CONFIG.turnWindowFar
			? this.direction
			: null;
	}

	/** @returns {boolean} Whether obstacle collision should yield attention to the corner. */
	protectedWindow() {
		if (!this.gate.visible) return false;
		return this.gate.position.z >= OLAM_CONFIG.turnWindowNear - 8
			&& this.gate.position.z <= OLAM_CONFIG.turnWindowFar;
	}

	/** @returns {number} Signed zero-to-one visual sweep strength for camera response. */
	bankStrength() {
		if (this.turnTime <= 0) return 0;
		const elapsed = 1 - this.turnTime / TURN_CONFIG.sweepSeconds;
		const direction = this.lastDirection === "left" ? -1 : 1;
		return direction * Math.sin(Math.PI * Math.max(0, Math.min(1, elapsed)));
	}

	/** @param {string} direction Correct turn direction. */
	resolve(direction) {
		this.lastDirection = direction;
		this.gate.visible = false;
		this.turnTime = TURN_CONFIG.sweepSeconds;
		this.turnCount += 1;
		this.onTurn(direction);
	}

	/** @param {string} direction Required direction. @param {number} z Spawn Z. */
	spawn(direction, z) {
		this.direction = direction === "right" ? "right" : "left";
		this.gate.position.z = z;
		this.gate.visible = true;
		this.road.position.z = z;
		this.roadFactory.configure(this.road, this.direction);
	}

	/** @param {string} direction Opens an immediate diagnostic corner. */
	forceWindow(direction = "left") {
		this.spawn(direction, -1);
	}
}
