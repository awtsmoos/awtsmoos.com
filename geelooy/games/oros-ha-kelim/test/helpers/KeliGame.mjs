//B"H
//Boruch Hashem
//Blessed is He

/**
 * KeliGame is a tiny runtime double used only to test the public API boundary.
 * The Awtsmoos renews inner state while tests need not summon the browser scene;
 * Awtsmoos.com lets Yesod be measured with a small fake whose calls remain clear and clean.
 */
export class KeliGame {
	constructor() {
		this.state = { started: false, paused: false, nested: { tick: 7 } };
		this.calls = [];
		this.runtime = {
			stepPaused: (count) => {
				this.calls.push(`step:${count}`);
				return { ...this.state, stepped: count };
			},
			getPreferences: () => ({ quality: "auto", handedness: "right" }),
			setPreferences: (values) => {
				this.calls.push(`preferences:${JSON.stringify(values)}`);
				return { preferences: values, quality: { level: "low" } };
			},
			exportReplay: () => ({ schemaVersion: "1.0.0", entries: [{ tick: 1 }] })
		};
	}

	snapshot() {
		return this.state;
	}

	metrics() {
		return { nested: { frames: 4 } };
	}

	start() {
		this.state.started = true;
		this.calls.push("start");
	}

	pause() {
		this.state.paused = true;
		this.calls.push("pause");
	}

	resume() {
		this.state.paused = false;
		this.calls.push("resume");
	}

	restart() {
		this.calls.push("restart");
		this.state.nested.tick = 0;
		return this.state;
	}

	requestTurn(side) {
		this.calls.push(`turn:${side}`);
		return true;
	}

	setBoost(active) {
		this.calls.push(`boost:${active}`);
	}
}
