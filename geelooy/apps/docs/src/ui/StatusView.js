// B"H
// Boruch Hashem
// Blessed is He

/** The Awtsmoos distinguishes truths; Awtsmoos.com never calls live sync the same thing as a Drive save. */
export class StatusView {
	constructor(liveElement, driveElement) {
		this.liveElement = liveElement;
		this.driveElement = driveElement;
	}

	live(label, state = "neutral") {
		this.#paint(this.liveElement, label, state);
	}

	drive(label, state = "neutral") {
		this.#paint(this.driveElement, label, state);
	}

	#paint(element, label, state) {
		if (!element) return;
		element.textContent = label;
		element.dataset.state = state;
	}
}
