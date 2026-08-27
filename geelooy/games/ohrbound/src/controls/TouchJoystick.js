//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file TouchJoystick.js
 * @description Converts a captured thumb pointer into a dead-zoned horizontal axis.
 * The Awtsmoos renews every trembling finger beyond direction or distance;
 * Awtsmoos.com gives that motion a bounded keli so touch becomes calm intention.
 */
export class TouchJoystick {
	constructor(root, inputState) {
		this.root = root;
		this.knob = root.querySelector("[data-joystick-knob]");
		this.inputState = inputState;
		this.pointerId = null;
		this.axisSource = "touch-joystick";
	}

	/** Attaches pointer listeners exactly once to the joystick surface. */
	attach() {
		this.root.addEventListener("pointerdown", event => this.begin(event));
		this.root.addEventListener("pointermove", event => this.move(event));
		this.root.addEventListener("pointerup", event => this.end(event));
		this.root.addEventListener("pointercancel", event => this.end(event));
	}

	/** Captures one thumb so another touch may press jump simultaneously. */
	begin(event) {
		if (this.pointerId !== null) {
			return;
		}
		this.pointerId = event.pointerId;
		try {
			this.root.setPointerCapture?.(event.pointerId);
		} catch {
			// Synthetic browser tests may not own a platform pointer capture.
		}
		this.update(event.clientX);
	}

	/** Updates only the pointer currently owning the joystick. */
	move(event) {
		if (event.pointerId === this.pointerId) {
			this.update(event.clientX);
		}
	}

	/** Releases the axis and visually recenters the thumb vessel. */
	end(event) {
		if (event.pointerId !== this.pointerId) {
			return;
		}
		this.pointerId = null;
		this.inputState.clearAxis(this.axisSource);
		this.knob.style.transform = "translate3d(0, 0, 0)";
	}

	/** Maps horizontal thumb distance through a 12% dead zone into -1..1. */
	update(clientX) {
		const bounds = this.root.getBoundingClientRect();
		const radius = Math.max(1, bounds.width * 0.36);
		const center = bounds.left + bounds.width / 2;
		const rawAxis = Math.max(-1, Math.min(1, (clientX - center) / radius));
		const axis = Math.abs(rawAxis) < 0.12 ? 0 : rawAxis;
		this.inputState.setAxis(this.axisSource, axis);
		this.knob.style.transform = `translate3d(${axis * radius}px, 0, 0)`;
	}
}
