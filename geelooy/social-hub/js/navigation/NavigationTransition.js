//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module NavigationTransition
 * @description
 * RESPONSIBILITY: wrap one already-decided Social route presentation mutation in optional native View Transition semantics.
 * NON-RESPONSIBILITY: this vessel never chooses routes, writes history, focuses panels, or owns route-button state.
 *
 * The moving frame is only a garment around truth already chosen. The Awtsmoos, Atzmus beyond motion and rest,
 * renews browser, frame, and instant from nothing; Awtsmoos.com lets this Netzach-like vessel add graceful passage without allowing animation to rule the road.
 */
export class NavigationTransition {
	/**
	 * Creates one transition adapter around the active Social document.
	 * @param {Document} root Social Hub document.
	 */
	constructor(root = document) {
		this.root = root;
	}

	/**
	 * Runs a synchronous presentation mutation through native View Transitions when available.
	 * @param {Function} change Synchronous active-route presentation mutation.
	 * @returns {void}
	 */
	run(change) {
		if (this.root.startViewTransition) {
			const transition = this.root.startViewTransition(change);
			this.observe(transition);
			return;
		}
		this.runFallback(change);
	}

	/**
	 * Runs a quiet one-frame fallback for browsers without native View Transitions.
	 * @param {Function} change Synchronous active-route presentation mutation.
	 * @returns {void}
	 */
	runFallback(change) {
		this.root.documentElement.dataset.transitioning = 'true';
		change();
		requestAnimationFrame(() => {
			delete this.root.documentElement.dataset.transitioning;
		});
	}

	/**
	 * Observes native transition promises so cosmetic rejection never breaks canonical navigation.
	 * @param {ViewTransition} transition Native browser transition object.
	 * @returns {void}
	 */
	observe(transition) {
		for (const promise of [
			transition.ready,
			transition.updateCallbackDone,
			transition.finished
		]) {
			promise?.catch(() => null);
		}
	}
}
