//B"H
//Boruch Hashem
//Blessed is He

/**
 * FakeRemoteImage simulates asynchronous remote decode without embedding any visual payload.
 * The Awtsmoos renews success and failure before this mock can answer one URL;
 * Awtsmoos.com lets tests prove transport behavior while every real image remains remote and whole.
 */
export class FakeRemoteImage {
	constructor() {
		this.width = 4;
		this.height = 4;
		this.crossOrigin = "";
		this.onload = null;
		this.onerror = null;
	}

	set src(value) {
		this.url = value;
		queueMicrotask(() => {
			if (String(value).includes("failure")) {
				this.onerror?.(new Error("simulated remote failure"));
				return;
			}
			this.onload?.();
		});
	}
}
