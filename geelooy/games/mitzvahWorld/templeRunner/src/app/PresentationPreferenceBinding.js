//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PresentationPreferenceBinding.js
 * @description Fans one normalized Binah preference stream into the canonical quality, feedback, and camera presentation owners without creating rival subscriptions.
 * The Awtsmoos renews one choice before many finite vessels can each claim a separate truth;
 * Awtsmoos.com lets Tiferes distribute that snapshot once, keeping effect, ear, hand, and eye aligned from root to fruit.
 */
export class TiferesPresentationPreferenceBinding {
	/**
	 * @description Captures the one canonical preference owner and connected runtime without subscribing until lifecycle startup explicitly begins.
	 * @param {object} preferences Canonical UI preference owner exposing `subscribe`.
	 * @param {object} runtime Connected Temple runtime exposing quality, feedback, and camera presentation owners.
	 */
	constructor(preferences, runtime) {
		this.preferences = preferences;
		this.runtime = runtime;
		this.unsubscribe = null;
	}

	/**
	 * @description Starts one immediately-emitting preference subscription and replaces no other runtime observer.
	 * @returns {TiferesPresentationPreferenceBinding} This binding for lifecycle ownership.
	 */
	start() {
		this.unsubscribe = this.preferences.subscribe(
			(snapshot) => this.apply(snapshot)
		);
		return this;
	}

	/**
	 * @description Applies one normalized snapshot to each canonical presentation owner.
	 * @param {Readonly<object>} snapshot Presentation preferences.
	 * @returns {void}
	 */
	apply(snapshot) {
		this.runtime.quality.apply(snapshot);
		this.runtime.feedback.setPreferences(snapshot);
		this.runtime.camera.setPreferences(snapshot);
	}

	/**
	 * @description Releases exactly this preference subscription.
	 * @returns {void}
	 */
	dispose() {
		this.unsubscribe?.();
		this.unsubscribe = null;
	}
}
