// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module PostResonanceObserver
 * @description
 * The Awtsmoos lets many meanings resonate without confusing their identities.
 * Awtsmoos.com coalesces geometry in animation frames and protects readable text.
 */
import { PostVisibilityObserver } from "./postVisibilityObserver.js";
import { createResonanceAnchor } from "./resonanceAnchor.js";
import { bindResonanceEvents } from "./resonanceEventRouter.js";

const PRIORITIES = Object.freeze({
	audio: 1.4,
	focus: 1.2,
	graph: 1.15,
	hover: 0.75,
	poll: 1.3
});

/** Connects semantic DOM state to independent procedural channels. */
export class PostResonanceObserver {
	constructor(scene, documentRef = document) {
		this.scene = scene;
		this.documentRef = documentRef;
		this.feed = documentRef.querySelector("[data-home-feed]");
		this.pending = new Map();
		this.frame = 0;
		this.feedFrame = 0;
		this.visibility = new PostVisibilityObserver(documentRef);
		this.resizeObserver = new ResizeObserver(() => this.scheduleFeedBounds());
		this.unbindEvents = null;
	}

	start() {
		this.unbindEvents = bindResonanceEvents(this, this.scene, this.documentRef);
		this.visibility.start();
		if (this.feed) {
			this.resizeObserver.observe(this.feed);
			this.scheduleFeedBounds();
		}
	}

	activate(event, channel, strength, duration = 0) {
		const article = event.target.closest?.("[data-cosmic-post]");
		if (!article) {
			return;
		}
		this.pending.set(channel, { article, strength, duration });
		article.dataset.cosmicActive = channel;
		if (!this.frame) {
			this.frame = requestAnimationFrame(() => this.flush());
		}
	}

	deactivate(event, channel) {
		const article = event.target.closest?.("[data-cosmic-post]");
		if (article && article.contains(event.relatedTarget)) {
			return;
		}
		this.clear(channel, article);
	}

	clear(channel, target) {
		this.pending.delete(channel);
		this.scene.clearInteractionChannel(channel);
		const article = target?.closest?.("[data-cosmic-post]") || target;
		if (article?.dataset?.cosmicActive === channel) {
			delete article.dataset.cosmicActive;
		}
	}

	flush() {
		this.frame = 0;
		for (const [channel, signal] of this.pending) {
			this.scene.setInteractionChannel(
				channel,
				createResonanceAnchor(signal.article, signal.strength),
				{
					priority: PRIORITIES[channel] || 1,
					duration: signal.duration
				}
			);
		}
		this.pending.clear();
	}

	scheduleFeedBounds() {
		if (this.feedFrame) {
			return;
		}
		this.feedFrame = requestAnimationFrame(() => {
			this.feedFrame = 0;
			if (this.feed) {
				this.scene.setFeedBounds(this.feed.getBoundingClientRect());
			}
		});
	}

	destroy() {
		this.unbindEvents?.();
		cancelAnimationFrame(this.frame);
		cancelAnimationFrame(this.feedFrame);
		this.resizeObserver.disconnect();
		this.visibility.destroy();
		this.pending.clear();
	}
}
