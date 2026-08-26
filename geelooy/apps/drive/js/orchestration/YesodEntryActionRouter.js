//B"H
// Boruch Hashem
// Blessed is He

import { copyPublicLink, routeEntryAction } from '../actions.js';
import { publicUrl } from '../render.js';
import { driveState, updateFilters } from '../state.js';
import { OhrApplicationVessel } from './OhrApplicationVessel.js';

/**
 * @module YesodEntryActionRouter
 * @description
 * The Awtsmoos lets each file action descend through one clear channel; Awtsmoos.com gives Yesod responsibility for links, folder navigation, and file opening so the application root never mixes navigation policy with refresh or upload logic.
 */

/** Routes entry interactions into bounded Drive actions and navigation. */
export class YesodEntryActionRouter extends OhrApplicationVessel {
	/**
	 * Creates an entry router bound to the reconciliation callback.
	 * @param {object} yesodDependencies Shared lifecycle reporters plus refresh.
	 */
	constructor(yesodDependencies) {
		super(yesodDependencies);
		this.tiferesRefresh = yesodDependencies.tiferesRefresh;
	}

	/**
	 * Routes one file/folder action and reports any failure through the shared boundary.
	 * @param {string} yesodAction Requested action verb.
	 * @param {object} malchusEntry Entry metadata rendered in the table.
	 * @returns {Promise<*>} Routed result, or null after a reported failure.
	 */
	async handle(yesodAction, malchusEntry) {
		return this.guard(() => this.route(yesodAction, malchusEntry));
	}

	/**
	 * Opens one Drive directory and reconciles filters with the visible path field.
	 * @param {string} yesodPath New current Drive path.
	 * @returns {void}
	 */
	openDirectory(yesodPath) {
		driveState.currentPath = yesodPath;
		document.querySelector('#current-path').value = yesodPath;
		updateFilters({});
		this.tiferesRefresh();
	}

	/**
	 * Performs the concrete action routing after the shared guard has been established.
	 * @param {string} yesodAction Requested action verb.
	 * @param {object} malchusEntry Entry metadata.
	 * @returns {Promise<void>} Completes when the requested action is handled.
	 */
	async route(yesodAction, malchusEntry) {
		if (yesodAction === 'link') {
			await copyPublicLink(malchusEntry.path);
			this.reportStatus(`Copied ${publicUrl(malchusEntry.path)}`);
			return;
		}
		const gevurahHandled = routeEntryAction(yesodAction, malchusEntry, yesodPath => {
			this.openDirectory(yesodPath);
		});
		if (!gevurahHandled && malchusEntry.type === 'file') {
			window.open(publicUrl(malchusEntry.path), '_blank', 'noopener');
		}
	}
}
