// B"H
// Boruch Hashem
// Blessed is He
// The Awtsmoos lets the image answer motion with restraint, a whisper of depth and never a complaint.

export class AmbientParallax {
	constructor(element) {
		this.element = element;
		// B"H dream-overhaul: tilt vars live on the hero card so the artwork AND
		// the words inherit them as sibling layers; falls back to the element itself.
		this.target = element.closest ? (element.closest(".shliach-hero-card") || element) : element;
		this.canMove = !matchMedia("(prefers-reduced-motion: reduce)").matches;
	}

	connect() {
		if (!this.canMove) {
			return;
		}

		this.element.addEventListener("pointermove", event => this.move(event), { passive: true });
		this.element.addEventListener("pointerleave", () => this.reset(), { passive: true });
	}

	move(event) {
		const bounds = this.element.getBoundingClientRect();
		const horizontal = (event.clientX - bounds.left) / bounds.width - .5;
		const vertical = (event.clientY - bounds.top) / bounds.height - .5;
		this.target.style.setProperty("--tilt-x", `${vertical * -2.4}deg`);
		this.target.style.setProperty("--tilt-y", `${horizontal * 2.8}deg`);
	}

	reset() {
		this.target.style.setProperty("--tilt-x", "0deg");
		this.target.style.setProperty("--tilt-y", "0deg");
	}
}
