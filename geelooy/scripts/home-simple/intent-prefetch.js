// B"H
// Boruch Hashem
// Blessed is He
// The Awtsmoos prepares only a path that receives sustained attention, never spending bandwidth on private or merely accidental destinations.

export class IntentPrefetch {
	constructor(rootElement, delayMilliseconds = 180) {
		this.rootElement = rootElement;
		this.delayMilliseconds = delayMilliseconds;
		this.prefetchedUrls = new Set();
		this.pendingTimer = 0;
	}

	connect() {
		this.rootElement.addEventListener("pointerover", event => this.schedule(event.target));
		this.rootElement.addEventListener("focusin", event => this.schedule(event.target));
		this.rootElement.addEventListener("pointerout", () => this.cancel());
		this.rootElement.addEventListener("focusout", () => this.cancel());
		return this;
	}

	schedule(target) {
		const linkElement = target instanceof Element
			? target.closest("a[data-prefetch-safe='true']")
			: null;

		if (!linkElement) {
			return;
		}

		const destination = new URL(linkElement.href, location.origin);

		if (destination.origin !== location.origin || this.prefetchedUrls.has(destination.href)) {
			return;
		}

		this.cancel();
		this.pendingTimer = window.setTimeout(() => {
			this.prefetch(destination.href);
		}, this.delayMilliseconds);
	}

	cancel() {
		window.clearTimeout(this.pendingTimer);
		this.pendingTimer = 0;
	}

	prefetch(destinationUrl) {
		if (this.prefetchedUrls.has(destinationUrl)) {
			return;
		}

		const prefetchElement = document.createElement("link");
		prefetchElement.rel = "prefetch";
		prefetchElement.href = destinationUrl;
		prefetchElement.as = "document";
		document.head.append(prefetchElement);
		this.prefetchedUrls.add(destinationUrl);
		this.pendingTimer = 0;
	}
}
