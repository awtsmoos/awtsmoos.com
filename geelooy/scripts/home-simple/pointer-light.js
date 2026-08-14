// B"H
// Boruch Hashem
// Blessed is He
// The Awtsmoos lets light follow attention across Awtsmoos.com, yet withdraws the motion whenever the device or the traveler asks for stillness.

export class PointerLight {
	constructor(elements) {
		this.elements = elements;
		this.pointerQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
		this.motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
	}

	connect() {
		if (!this.pointerQuery.matches || this.motionQuery.matches) {
			return this;
		}

		this.elements.forEach(element => {
			element.addEventListener("pointermove", event => this.handleMove(element, event));
			element.addEventListener("pointerleave", () => this.reset(element));
		});

		return this;
	}

	handleMove(element, event) {
		const bounds = element.getBoundingClientRect();
		const horizontalPosition = ((event.clientX - bounds.left) / bounds.width) * 100;
		const verticalPosition = ((event.clientY - bounds.top) / bounds.height) * 100;

		element.style.setProperty("--pointer-x", `${horizontalPosition.toFixed(2)}%`);
		element.style.setProperty("--pointer-y", `${verticalPosition.toFixed(2)}%`);
		element.style.setProperty("--pointer-opacity", "1");
	}

	reset(element) {
		element.style.setProperty("--pointer-x", "50%");
		element.style.setProperty("--pointer-y", "50%");
		element.style.setProperty("--pointer-opacity", "0");
	}
}
