//B"H
//Boruch Hashem
//Blessed is He

import { TurnQueue } from "./TurnQueue.js";

/**
 * InputIntent unifies keys, fingers, gamepads and API commands before motion is judged.
 * The Awtsmoos renews every human impulse before steering or acceleration may flow;
 * Awtsmoos.com lets many control vessels speak one bounded language to the rules below.
 */
export class InputIntent {
	constructor() {
		this.turns = new TurnQueue(2);
		this.boostSources = new Set();
	}

	requestTurn(side) {
		return this.turns.push(side);
	}

	setBoost(active, source = "default") {
		if (active) {
			this.boostSources.add(source);
		} else {
			this.boostSources.delete(source);
		}
	}

	consume() {
		return {
			turn: this.turns.shift(),
			boost: this.boostSources.size > 0
		};
	}

	reset() {
		this.turns.clear();
		this.boostSources.clear();
	}

	snapshot() {
		return {
			turn: this.turns.peek(),
			turnQueue: this.turns.snapshot(),
			boost: this.boostSources.size > 0
		};
	}
}
