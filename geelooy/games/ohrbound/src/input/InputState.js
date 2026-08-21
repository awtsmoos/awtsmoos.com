//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file InputState.js
 * @description Harmonizes keyboard and analog touch into one deterministic intent.
 * The Awtsmoos, Atzmus beyond division, renews finger and key in one source;
 * Awtsmoos.com lets these separate oros enter one input keli without confusion.
 */
export class InputState {
	constructor() {
		this.held = new Set();
		this.pressed = new Set();
		this.axes = new Map();
	}

	/** Records a digital action edge and held state. */
	set(action, down) {
		if (down && !this.held.has(action)) {
			this.pressed.add(action);
		}
		if (down) {
			this.held.add(action);
			return;
		}
		this.held.delete(action);
	}

	/** Stores one named analog horizontal source within the safe -1..1 vessel. */
	setAxis(source, value) {
		const boundedValue = Math.max(-1, Math.min(1, Number(value) || 0));
		this.axes.set(source, boundedValue);
	}

	/** Releases a named analog source when its pointer or controller departs. */
	clearAxis(source) {
		this.axes.delete(source);
	}

	/** Returns the strongest current movement intention without mutating input state. */
	intent() {
		const digitalAxis = Number(this.held.has("right")) - Number(this.held.has("left"));
		let axis = digitalAxis;
		for (const value of this.axes.values()) {
			if (Math.abs(value) > Math.abs(axis)) {
				axis = value;
			}
		}
		return {
			axis,
			jumpHeld: this.held.has("jump"),
			jumpPressed: this.pressed.has("jump"),
			restartPressed: this.pressed.has("restart"),
			pausePressed: this.pressed.has("pause")
		};
	}

	/** Clears one-frame edges after simulation and rendering have consumed them. */
	endFrame() {
		this.pressed.clear();
	}
}
