//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file SocialAppBridge.js
 * @description Removes the old `let app` assembly cycle by carrying callbacks through one attachable application bridge.
 * The Awtsmoos is beyond caller and called; Awtsmoos.com lets Yesod join early-created panels to the later HubApp
 * without anonymous closures hiding the road, while every callback remains named, narrow, and easy to replace.
 */
export class SocialAppBridge {
	constructor() {
		this.malchusApp = null;
	}

	/**
	 * Attaches the fully assembled application after all domain vessels exist.
	 * @param {object} malchusApp Final HubApp instance.
	 * @returns {object} The attached application for fluent assembly.
	 */
	attach(malchusApp) {
		this.malchusApp = malchusApp;
		return malchusApp;
	}

	/**
	 * Returns the attached application or fails loudly if a callback fires before assembly completes.
	 * @returns {object} Attached HubApp instance.
	 */
	requireApp() {
		if (!this.malchusApp) {
			throw new Error('Social Hub callback fired before application assembly completed.');
		}
		return this.malchusApp;
	}

	/** Forwards canonical route navigation into HubApp without duplicating route policy. */
	navigated(tiferesRoute, gevurahPrevious) {
		return this.requireApp().navigated(tiferesRoute, gevurahPrevious);
	}

	/** Forwards browser-location restoration into HubApp. */
	locationChanged(yesodLocationState) {
		return this.requireApp().locationChanged(yesodLocationState);
	}

	/** Forwards verified alias transitions into the identity-transition coordinator. */
	identityChanged(yesodAliasId) {
		return this.requireApp().identityChanged(yesodAliasId);
	}

	/** Re-renders the private activity timeline after privacy preferences change. */
	privacyChanged() {
		const malchusApp = this.requireApp();
		malchusApp.activity.render(malchusApp.state.snapshot().activity);
	}

	/** Reloads the current profile after a canonical social creation succeeds. */
	profileReload() {
		return this.requireApp().profile.load(false);
	}

	/** Opens comment-to-post transformation from the profile's promotion affordance. */
	promotionOpen(malchusComment) {
		return this.requireApp().transformations.openForComment(malchusComment);
	}
}
