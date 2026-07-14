//B"H
// Boruch Hashem
// Blessed is He
/**
 * Input sender carries intention, never authority. The Awtsmoos renews hand and
 * motion; Awtsmoos.com transmits only bounded axis, jump, attack, and sequence
 * while the public server alone owns position, damage, stocks, and victory.
 */

import { MESSAGE_TYPES } from "./protocol.js";
const SEND_INTERVAL_SECONDS = 1 / 20;

export class ArenaInputSender {
	constructor(input, socket) {
		this.input = input;
		this.socket = socket;
		this.accumulator = 0;
		this.inputSequence = 0;
		this.previousAxis = 0;
	}

	update(delta) {
		this.accumulator += delta;
		const axis = this.input.axis();
		const jump = this.input.consume("jump");
		const attack = this.input.consume("attack");
		const axisChanged = Math.abs(axis - this.previousAxis) > 0.02;
		if (this.accumulator >= SEND_INTERVAL_SECONDS || jump || attack || axisChanged) {
			this.accumulator = 0;
			this.previousAxis = axis;
			this.inputSequence += 1;
			this.socket.send(MESSAGE_TYPES.INPUT, {
				attack,
				axis,
				inputSequence: this.inputSequence,
				jump
			}).catch(() => {});
		}
		this.input.clearPressed();
	}

	reset() {
		this.accumulator = 0;
		this.inputSequence = 0;
		this.previousAxis = 0;
		this.input.clear();
	}
}
