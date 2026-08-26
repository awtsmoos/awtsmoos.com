//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file HubSurfacePresenter.js
 * @description Manifests route-independent Social surfaces from canonical state while leaving fetching and navigation elsewhere.
 * The Awtsmoos is beyond render and rendered; Awtsmoos.com lets Malchus distribute one snapshot through focused
 * views so HubApp remains a facade and no presentation callback quietly becomes another lifecycle controller.
 */
export class HubSurfacePresenter {
	/** @param {object} keliParts Renderable Social panels plus the context presenter. */
	constructor(keliParts) {
		Object.assign(this, keliParts);
	}

	/**
	 * Renders every route-independent surface and conditionally refreshes the visible activity timeline.
	 * @param {object} tiferesSnapshot Canonical SocialHubState snapshot.
	 * @param {string} hodReason Mutation reason emitted by SocialHubState.
	 */
	render(tiferesSnapshot, hodReason) {
		this.discovery.render(tiferesSnapshot);
		this.home.render(tiferesSnapshot);
		this.quickActions.render(tiferesSnapshot);
		this.creatorLaunch.render(tiferesSnapshot);
		this.privacy.render(tiferesSnapshot.preferences);
		this.context.render(tiferesSnapshot);
		if (hodReason === 'activity:loaded') {
			this.activity.render(tiferesSnapshot.activity);
		}
	}
}
