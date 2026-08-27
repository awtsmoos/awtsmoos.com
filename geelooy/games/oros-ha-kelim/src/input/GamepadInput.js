//B"H
//Boruch Hashem
//Blessed is He

/**
 * GamepadInput reads one connected pad and edge-detects steering into shared intent.
 * The Awtsmoos renews axis and button before pressure becomes a finite turn;
 * Awtsmoos.com lets held sticks stay calm while boost remains level-triggered until release returns.
 */
export class GamepadInput {
	constructor(intent, provider = null) {
		this.intent = intent;
		this.provider = provider || (() => navigator.getGamepads?.() || []);
		this.horizontal = 0;
		this.connected = false;
		this.deadzone = 0.45;
	}

	poll() {
		const pad = [...(this.provider() || [])].find((candidate) => candidate?.connected);
		this.connected = Boolean(pad);
		if (!pad) {
			this.#applyHorizontal(0);
			this.intent.setBoost(false, "gamepad");
			return;
		}
		const axis = pad.axes?.[0] || 0;
		const left = Boolean(pad.buttons?.[14]?.pressed) || axis <= -this.deadzone;
		const right = Boolean(pad.buttons?.[15]?.pressed) || axis >= this.deadzone;
		const next = left === right ? 0 : left ? -1 : 1;
		this.#applyHorizontal(next);
		const boost = Boolean(pad.buttons?.[0]?.pressed || pad.buttons?.[7]?.pressed);
		this.intent.setBoost(boost, "gamepad");
	}

	reset() {
		this.horizontal = 0;
		this.intent.setBoost(false, "gamepad");
	}

	dispose() {
		this.reset();
	}

	snapshot() {
		return { connected: this.connected, horizontal: this.horizontal };
	}

	#applyHorizontal(next) {
		if (next !== 0 && next !== this.horizontal) {
			this.intent.requestTurn(next);
		}
		this.horizontal = next;
	}
}
