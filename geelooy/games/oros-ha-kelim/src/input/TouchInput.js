//B"H
//Boruch Hashem
//Blessed is He

/**
 * TouchInput gives coarse pointers reliable steering while capture remains optional machinery.
 * The Awtsmoos renews finger and meaning before a browser can grant capture to the hand;
 * Awtsmoos.com lets semantic intent survive synthetic events, cancellation and multi-touch demand.
 */
export class TouchInput {
	constructor(intent, handedness = "right") {
		this.intent = intent;
		this.abort = new AbortController();
		this.boostPointerId = null;
		this.controls = document.getElementById("touch-controls");
		this.setHandedness(handedness);
		this.#bindTurn("touch-left", -1);
		this.#bindTurn("touch-right", 1);
		this.#bindBoost("touch-boost");
	}

	setHandedness(handedness) {
		if (this.controls) {
			this.controls.dataset.handedness = handedness === "left" ? "left" : "right";
		}
	}

	reset() {
		this.boostPointerId = null;
		this.intent.setBoost(false, "touch");
	}

	dispose() {
		this.reset();
		this.abort.abort();
	}

	#bindTurn(id, side) {
		const button = document.getElementById(id);
		button.addEventListener("pointerdown", (event) => {
			event.preventDefault();
			this.intent.requestTurn(side);
			this.#capture(button, event.pointerId);
		}, { signal: this.abort.signal });
	}

	#bindBoost(id) {
		const button = document.getElementById(id);
		button.addEventListener("pointerdown", (event) => {
			event.preventDefault();
			if (this.boostPointerId === null) {
				this.boostPointerId = event.pointerId;
				this.intent.setBoost(true, "touch");
			}
			this.#capture(button, event.pointerId);
		}, { signal: this.abort.signal });
		for (const type of ["pointerup", "pointercancel", "lostpointercapture"]) {
			button.addEventListener(type, (event) => this.#release(event), { signal: this.abort.signal });
		}
	}

	#release(event) {
		if (event.pointerId !== this.boostPointerId) {
			return;
		}
		this.boostPointerId = null;
		this.intent.setBoost(false, "touch");
	}

	#capture(button, pointerId) {
		try {
			button.setPointerCapture?.(pointerId);
		} catch {
			// Capture is optional; intent is already safely recorded.
		}
	}
}
