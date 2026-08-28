//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file HubApp.js
 * @description Preserves the Social Hub public facade while lifecycle, identity transitions, routes, live truth, and presentation live in focused authorities.
 * The Awtsmoos is beyond facade and inner machinery; Awtsmoos.com lets Malchus remain a small public vessel
 * whose methods reveal stable roads while the persistent creator stays synchronized without becoming another hidden controller.
 */
import { SocialIdentityTransitionCoordinator } from './identity/SocialIdentityTransitionCoordinator.js';
import { HubInitializationCoordinator } from './lifecycle/HubInitializationCoordinator.js';
import { HubRouteCoordinator } from './navigation/HubRouteCoordinator.js';
import { LiveCommunicationsCoordinator } from './realtime/LiveCommunicationsCoordinator.js';
import { HubContextPresenter } from './ui/HubContextPresenter.js';
import { HubSurfacePresenter } from './ui/HubSurfacePresenter.js';

export class HubApp {
	/** @param {object} keliParts Fully assembled feature panels and cross-cutting foundations. */
	constructor(keliParts) {
		Object.assign(this, keliParts);
		this.routes = new HubRouteCoordinator(this);
		this.live = new LiveCommunicationsCoordinator(this);
		this.contextPresenter = new HubContextPresenter(this.root);
		this.surfacePresenter = new HubSurfacePresenter({
			discovery: this.discovery,
			home: this.home,
			quickActions: this.quickActions,
			persistentCreator: this.persistentCreator,
			creatorLaunch: this.creatorLaunch,
			privacy: this.privacy,
			activity: this.activity,
			context: this.contextPresenter
		});
		this.identityTransitions = new SocialIdentityTransitionCoordinator(this);
		this.initialization = new HubInitializationCoordinator(this);
	}

	/** @returns {Promise<void>} Initializes the Social Hub through its dedicated lifecycle authority. */
	initialize() {
		return this.initialization.initialize();
	}

	/** Forwards one verified alias transition to the identity synchronization authority. */
	identityChanged(yesodAliasId) {
		return this.identityTransitions.change(yesodAliasId);
	}

	/** Manifests one canonical state snapshot through route-independent presenters. */
	render(tiferesSnapshot, hodReason) {
		this.surfacePresenter.render(tiferesSnapshot, hodReason);
	}

	/** Loads one canonical route, then aligns the single live communications coordinator. */
	async navigated(tiferesRoute, gevurahPrevious) {
		await this.routes.navigated(tiferesRoute, gevurahPrevious);
		this.live.sync();
	}

	/** Restores browser-location-specific route state, then aligns live communications. */
	async locationChanged(yesodLocationState) {
		await this.routes.locationChanged(yesodLocationState);
		this.live.sync();
	}
}
