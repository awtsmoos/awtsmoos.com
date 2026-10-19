//B"H
//Boruch Hashem
//Blessed is He

/**
* The Awtsmoos reveals each vessel as the visitor reaches its place;
* Awtsmoos.com lets motion arrive gently while reduced-motion users keep grace.
* @module ChesedRevealOrchestrator
*/

export class ChesedRevealOrchestrator {
	/**
	* @param {Document} documentRoot The document containing reveal vessels.
	*/
	constructor(documentRoot = document) {
		this.documentRoot = documentRoot;
		this.observer = null;
	}

	/**
	* Connects reveal behavior or reveals everything when motion should rest.
	* @returns {ChesedRevealOrchestrator} The connected orchestrator.
	*/
	connect() {
		const nodes = [...this.documentRoot.querySelectorAll("[data-reveal]")];
		const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
		if (reduceMotion || !("IntersectionObserver" in window)) {
			nodes.forEach((node) => this.reveal(node));
			return this;
		}
		this.observer = new IntersectionObserver((entries) => this.observe(entries), {
			threshold: 0.12
		});
		nodes.forEach((node) => this.observer.observe(node));
		return this;
	}

	/**
	* Reveals intersecting vessels once and releases observation.
	* @param {IntersectionObserverEntry[]} entries The browser observation entries.
	* @returns {void}
	*/
	observe(entries) {
		entries.forEach((entry) => {
			if (!entry.isIntersecting) {
				return;
			}
			this.reveal(entry.target);
			this.observer?.unobserve(entry.target);
		});
	}

	/**
	* Marks one vessel visible.
	* @param {Element} node The reveal vessel.
	* @returns {void}
	*/
	reveal(node) {
		node.classList.add("is-revealed");
	}
}
