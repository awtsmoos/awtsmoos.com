//B"H
//Boruch Hashem
//Blessed is He

/**
 * DesktopInput translates keyboard motion into the shared bounded intent vessel.
 * The Awtsmoos renews each key before a rider turns or gathers speed in flight;
 * Awtsmoos.com keeps keyboard listeners disposable and every source of boost distinct in light.
 */
export class DesktopInput {
	constructor(intent, restart) {
		this.intent = intent;
		this.restart = restart;
		this.boostKeys = new Set();
		this.abort = new AbortController();
		const options = { signal: this.abort.signal };
		window.addEventListener("keydown", (event) => this.#down(event), options);
		window.addEventListener("keyup", (event) => this.#up(event), options);
	}

	reset() {
		this.boostKeys.clear();
		this.intent.setBoost(false, "desktop");
	}

	dispose() {
		this.reset();
		this.abort.abort();
	}

	#down(event) {
		if (!event.repeat && ["ArrowLeft", "KeyA"].includes(event.code)) {
			this.intent.requestTurn(-1);
		}
		if (!event.repeat && ["ArrowRight", "KeyD"].includes(event.code)) {
			this.intent.requestTurn(1);
		}
		if (["ArrowUp", "KeyW", "ShiftLeft", "ShiftRight", "Space"].includes(event.code)) {
			this.boostKeys.add(event.code);
			this.intent.setBoost(true, "desktop");
		}
		if (!event.repeat && event.code === "KeyR") {
			this.restart();
		}
		if (event.code.startsWith("Arrow") || event.code === "Space") {
			event.preventDefault();
		}
	}

	#up(event) {
		this.boostKeys.delete(event.code);
		this.intent.setBoost(this.boostKeys.size > 0, "desktop");
	}
}
