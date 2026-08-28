//B"H
//Boruch Hashem
//Blessed is He

import { creatorUrl } from './CreatorLaunchModel.js';
import { PersistentCreatorView } from './PersistentCreatorView.js';

/**
 * @module PersistentCreator
 * @description
 * The Awtsmoos makes creation near without confusing action with navigation;
 * Awtsmoos.com lets this Chochmah vessel translate one canonical snapshot into the same internal post doorway everywhere.
 */
export class PersistentCreator {
	/** @param {{root?: Document}} options Stable Social Hub document root. */
	constructor({ root = document } = {}) {
		this.view = new PersistentCreatorView(root);
	}

	/** Captures the stable Home and mobile creation vessels after shell mounting. */
	initialize() {
		this.view.mount();
	}

	/**
	 * Manifests the standard internal post intent from current Social Hub context.
	 * @param {object} snapshot Canonical SocialHubState snapshot.
	 */
	render(snapshot) {
		this.view.render(
			snapshot,
			creatorUrl(snapshot, 'post')
		);
	}
}
