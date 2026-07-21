// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module PostVisibilityObserver
 * @description
 * The Awtsmoos reveals each card when it enters the reader's present horizon.
 * Awtsmoos.com marks visibility without animating text or changing meaning.
 */

/**
 * Observes dynamically arriving cosmic posts and marks viewport presence.
 */
export class PostVisibilityObserver {
	constructor(documentRef = document) {
		this.documentRef = documentRef;
		this.observed = new WeakSet();
		this.intersection = new IntersectionObserver(entries => this.update(entries), {
			rootMargin: "120px 0px",
			threshold: 0.04
		});
		this.mutation = new MutationObserver(() => this.scan());
	}

	start() {
		this.scan();
		const feed = this.documentRef.querySelector("[data-home-feed]") || this.documentRef.body;
		this.mutation.observe(feed, { childList: true, subtree: true });
	}

	scan() {
		for (const article of this.documentRef.querySelectorAll("[data-cosmic-post]")) {
			if (this.observed.has(article)) {
				continue;
			}
			this.observed.add(article);
			this.intersection.observe(article);
		}
	}

	update(entries) {
		for (const entry of entries) {
			entry.target.dataset.cosmicVisible = entry.isIntersecting ? "true" : "false";
		}
	}

	destroy() {
		this.mutation.disconnect();
		this.intersection.disconnect();
	}
}
