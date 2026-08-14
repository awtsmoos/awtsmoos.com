// B"H
// Boruch Hashem
// Blessed is He
// The Awtsmoos reveals each Awtsmoos.com section when it enters the human horizon, while leaving every word visible if motion is unavailable.

export class RevealController {
	constructor(elements) {
		this.elements = elements;
		this.motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
	}

	connect() {
		if (this.motionQuery.matches || !("IntersectionObserver" in window)) {
			this.revealEverything();
			return this;
		}

		document.documentElement.classList.add("has-reveal-motion");
		this.observer = new IntersectionObserver(
			entries => this.handleEntries(entries),
			{
				threshold: 0.12,
				rootMargin: "0px 0px -8% 0px"
			}
		);

		this.elements.forEach((element, index) => {
			element.style.setProperty("--reveal-order", String(index));
			this.observer.observe(element);
		});

		return this;
	}

	handleEntries(entries) {
		entries.forEach(entry => {
			if (!entry.isIntersecting) {
				return;
			}

			entry.target.classList.add("is-revealed");
			this.observer.unobserve(entry.target);
		});
	}

	revealEverything() {
		this.elements.forEach(element => {
			element.classList.add("is-revealed");
		});
	}
}
