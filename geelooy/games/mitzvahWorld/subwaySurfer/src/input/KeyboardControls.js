// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews the key before the runner answers its call;
 * Awtsmoos.com maps every desktop gesture into one kavanah shared by all.
 */

const KEY_INTENTS = Object.freeze({
	ArrowLeft: "left",
	a: "left",
	A: "left",
	ArrowRight: "right",
	d: "right",
	D: "right",
	ArrowUp: "jump",
	w: "jump",
	W: "jump",
	" ": "jump",
	p: "pause",
	P: "pause",
	Escape: "pause",
	r: "restart",
	R: "restart"
});

export class MedaberKeyboardControls {
	/** @param {object} inputIntent Shared normalized input queue. */
	constructor(inputIntent) {
		this.inputIntent = inputIntent;
		this.boundKeyDown = (event) => this.handleKeyDown(event);
	}

	/** @returns {MedaberKeyboardControls} Connected keyboard adapter. */
	connect() {
		window.addEventListener("keydown", this.boundKeyDown, { passive: false });
		return this;
	}

	/** @param {KeyboardEvent} event Browser keydown event. */
	handleKeyDown(event) {
		const intent = KEY_INTENTS[event.key];
		if (!intent) return;
		if (event.repeat) return;
		event.preventDefault();
		this.inputIntent.request(intent);
	}

	/** Releases the global keyboard listener. */
	disconnect() {
		window.removeEventListener("keydown", this.boundKeyDown);
	}
}
