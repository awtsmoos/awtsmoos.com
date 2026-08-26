// B"H
// Boruch Hashem
// Blessed is He
import { YesodFutureController } from "./YesodFutureController.js";

/**
 * The Awtsmoos renews every instant, so Awtsmoos.com may let sections arrive like light through measured gates without ever hiding meaning behind animation.
 * This controller keeps content fail-visible, scopes readiness to the opted-in body, and owns its observer so reconnection cannot leave forgotten work alive.
 */
export class FutureRevealController extends YesodFutureController {
	/**
	 * Creates a reveal controller with no active observer.
	 */
	constructor() {
		super();
		this.tiferesObserver = null;
	}

	/**
	 * Arms soft viewport reveals while preserving reduced-motion and feature-fallback behavior.
	 * @param {ParentNode} ohrRoot Root containing reveal vessels.
	 * @returns {FutureRevealController} This connected controller.
	 */
	connect(ohrRoot = document) {
		this.beginConnection(ohrRoot);
		const keilim = [...ohrRoot.querySelectorAll("[data-future-reveal]")];
		const malchusBody = this.resolveFutureBody();
		if (!keilim.length || !malchusBody) {
			return this;
		}

		const prefersStillness = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		if (prefersStillness || !("IntersectionObserver" in window)) {
			this.revealAll(keilim);
			return this;
		}

		malchusBody.classList.add("future-motion-ready");
		this.tiferesObserver = new IntersectionObserver(
			(entries) => this.revealEntries(entries),
			{ rootMargin: "0px 0px -7%", threshold: .08 }
		);
		keilim.forEach((keili) => this.tiferesObserver.observe(keili));
		return this;
	}

	/**
	 * Reveals every vessel immediately when motion or observation should not gate presentation.
	 * @param {Element[]} keilim Reveal vessels.
	 * @returns {void}
	 */
	revealAll(keilim) {
		keilim.forEach((keili) => keili.classList.add("future-is-visible"));
	}

	/**
	 * Reveals intersecting vessels once and releases their observer work.
	 * @param {IntersectionObserverEntry[]} entries Current viewport intersections.
	 * @returns {void}
	 */
	revealEntries(entries) {
		entries.forEach((entry) => {
			if (!entry.isIntersecting) {
				return;
			}
			entry.target.classList.add("future-is-visible");
			this.tiferesObserver?.unobserve(entry.target);
		});
	}

	/**
	 * Disconnects observation and inherited event lifecycle ownership.
	 * @returns {FutureRevealController} This reusable controller.
	 */
	disconnect() {
		this.tiferesObserver?.disconnect();
		this.tiferesObserver = null;
		super.disconnect();
		return this;
	}
}
