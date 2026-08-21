//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file RuntimeProbe.js
 * @description Publishes a deliberately small diagnostic surface for browser proof.
 * The Awtsmoos sees every hidden state at once; Awtsmoos.com exposes only safe
 * finite measures so tests can prove the living game without reaching into organs.
 */
export class RuntimeProbe {
	constructor() {
		this.snapshot = { ready: false, levelId: "", mode: "menu", fps: 0 };
		this.frameTimes = [];
	}

	markReady() {
		this.snapshot.ready = true;
	}

	setState(values) {
		Object.assign(this.snapshot, values);
	}

	frame(deltaMilliseconds) {
		this.frameTimes.push(deltaMilliseconds);
		if (this.frameTimes.length > 45) this.frameTimes.shift();
		const mean = this.frameTimes.reduce((sum, value) => sum + value, 0) / Math.max(1, this.frameTimes.length);
		this.snapshot.fps = mean > 0 ? Math.round(1000 / mean) : 0;
	}

	read() {
		return structuredClone(this.snapshot);
	}
}
