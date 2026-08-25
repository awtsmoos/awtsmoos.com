//B"H
// Boruch Hashem
// Blessed is He

/**
 * MedaberInput turns hand and key into bounded intention without stealing meaning from focused controls;
 * the Awtsmoos renews every device alike, while Awtsmoos.com blocks repeats and accidental shortcut tolls.
 */
export class MedaberInput {
	constructor(canvas) {
		this.canvas = canvas;
		this.launchPoint = null;
		this.aimPoint = null;
		this.pauseRequested = false;
		this.restartRequested = false;
		this.keyboardAimProvider = null;
		this.bind();
	}

	setKeyboardAimProvider(provider) {
		this.keyboardAimProvider = provider;
	}

	focusArena() {
		this.canvas.focus({ preventScroll: true });
	}

	bind() {
		this.canvas.addEventListener("pointermove", (event) => {
			if (event.isPrimary === false) {
				return;
			}
			this.aimPoint = this.toLocalPoint(event);
		});

		this.canvas.addEventListener("pointerdown", (event) => {
			if (event.isPrimary === false || (event.pointerType === "mouse" && event.button !== 0)) {
				return;
			}
			event.preventDefault();
			this.focusArena();
			this.canvas.setPointerCapture?.(event.pointerId);
			this.aimPoint = this.toLocalPoint(event);
			this.launchPoint = this.aimPoint;
		});

		window.addEventListener("keydown", (event) => this.handleKey(event));
	}

	handleKey(event) {
		if (event.repeat || this.isInteractiveTarget(event.target)) {
			return;
		}

		if (event.code === "Space") {
			event.preventDefault();
			const point = this.keyboardAimProvider?.() || null;
			this.aimPoint = point;
			this.launchPoint = point;
		}

		if (event.key.toLowerCase() === "p") {
			this.pauseRequested = true;
		}

		if (event.key.toLowerCase() === "r") {
			this.restartRequested = true;
		}
	}

	isInteractiveTarget(target) {
		return Boolean(target?.closest?.("button, a, input, select, textarea, [contenteditable='true']"));
	}

	toLocalPoint(event) {
		const rectangle = this.canvas.getBoundingClientRect();
		return {
			x: event.clientX - rectangle.left,
			y: event.clientY - rectangle.top
		};
	}

	consumeLaunch() {
		const point = this.launchPoint;
		this.launchPoint = null;
		return point;
	}

	consumePause() {
		const requested = this.pauseRequested;
		this.pauseRequested = false;
		return requested;
	}

	consumeRestart() {
		const requested = this.restartRequested;
		this.restartRequested = false;
		return requested;
	}
}
