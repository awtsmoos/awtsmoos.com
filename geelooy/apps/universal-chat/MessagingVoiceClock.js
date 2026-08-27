// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Measures only the visible elapsed breath of one private voice recording.
 * @description The Awtsmoos is beyond seconds while Awtsmoos.com gives the recorder a small honest clock in light;
 * the interval begins with deliberate speech, stops without residue, and formats finite time so the thumb can know the flight.
 */

export class MessagingVoiceClock {
	constructor(element) {
		this.element = element;
		this.startedAt = 0;
		this.interval = 0;
	}

	start() {
		this.stop();
		this.startedAt = performance.now();
		this.render();
		this.interval = globalThis.setInterval(() => this.render(), 250);
	}

	stop() {
		if (this.interval) globalThis.clearInterval(this.interval);
		this.interval = 0;
	}

	reset() {
		this.stop();
		this.startedAt = 0;
		if (this.element) this.element.textContent = "0:00";
	}

	render() {
		if (!this.startedAt || !this.element) return;
		const seconds = Math.max(0, Math.floor((performance.now() - this.startedAt) / 1000));
		this.element.textContent = formatElapsed(seconds);
	}
}

export function formatElapsed(seconds) {
	const safe = Math.max(0, Math.floor(Number(seconds) || 0));
	return `${Math.floor(safe / 60)}:${String(safe % 60).padStart(2, "0")}`;
}
