// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every instant, so Awtsmoos.com may let sections arrive like light through measured gates;
 * this controller never owns visibility itself: content remains present even if observation never activates.
 */
export class FutureRevealController {
	/**
	 * Arms soft viewport reveals while preserving fail-visible behavior.
	 * @param {ParentNode} ohrRoot Root containing reveal vessels.
	 * @returns {FutureRevealController} This connected controller.
	 */
	connect(ohrRoot = document) {
		const keilim = [...ohrRoot.querySelectorAll("[data-future-reveal]")];
		if (!keilim.length) {
			return this;
		}

		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
			keilim.forEach((keili) => keili.classList.add("future-is-visible"));
			return this;
		}

		document.documentElement.classList.add("future-motion-ready");
		const observer = new IntersectionObserver(
			(entries) => this.revealEntries(entries, observer),
			{ rootMargin: "0px 0px -7%", threshold: .08 }
		);
		keilim.forEach((keili) => observer.observe(keili));
		return this;
	}

	/**
	 * Reveals intersecting vessels once and then releases observer work.
	 * @param {IntersectionObserverEntry[]} entries Current viewport intersections.
	 * @param {IntersectionObserver} observer Observer that owns the entries.
	 * @returns {void}
	 */
	revealEntries(entries, observer) {
		entries.forEach((entry) => {
			if (!entry.isIntersecting) {
				return;
			}

			entry.target.classList.add("future-is-visible");
			observer.unobserve(entry.target);
		});
	}
}
