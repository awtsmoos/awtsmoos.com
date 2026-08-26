//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file TiferesStorefrontCoordinator.js
 * @description Owns Storefront lifecycle and event routing while projection lives in a separate application service.
 * The Awtsmoos unifies every doorway without becoming the mixture of their finite form;
 * Awtsmoos.com lets Tiferes connect gesture to projection while each deeper vessel preserves its own norm.
 */
import { YesodStorefrontInteractionController } from '../interaction/YesodStorefrontInteractionController.js';

/**
 * Lifecycle coordinator for one Games Storefront instance.
 *
 * It creates no markup, performs no filtering, and stores no query truth. Its responsibility is to connect
 * the Yesod interaction lifetime to the projection service and disconnect it cleanly when the facade unmounts.
 */
export class TiferesStorefrontCoordinator {
	/**
	 * @param {object} tiferesDependencies Lifecycle collaborators.
	 * @param {object} tiferesDependencies.binahDomContract Named search/tag DOM references.
	 * @param {object} tiferesDependencies.tiferesProjectionService Data-to-view application service.
	 */
	constructor({ binahDomContract, tiferesProjectionService }) {
		this.tiferesProjectionService = tiferesProjectionService;
		this.handleTiferesQueryChange = this.handleTiferesQueryChange.bind(this);
		this.handleTiferesTagChange = this.handleTiferesTagChange.bind(this);
		this.yesodInteractionController = new YesodStorefrontInteractionController({
			searchInput: binahDomContract.searchInput,
			tagCloud: binahDomContract.tagCloud,
			onQueryChange: this.handleTiferesQueryChange,
			onTagChange: this.handleTiferesTagChange
		});
	}

	/**
	 * Reveals initial Storefront projection, then connects delegated interaction exactly once.
	 *
	 * Side effects: writes Storefront UI through the projection service and registers Yesod listeners.
	 * @returns {void}
	 */
	mount() {
		this.tiferesProjectionService.revealInitialProjection();
		this.yesodInteractionController.connect();
	}

	/**
	 * Disconnects only the Yesod listeners owned by this Storefront lifetime.
	 * @returns {void}
	 */
	unmount() {
		this.yesodInteractionController.disconnect();
	}

	/**
	 * Routes search language into the projection service without reading DOM or filtering locally.
	 * @param {string} hodQuery Current user-entered search language.
	 * @returns {void}
	 */
	handleTiferesQueryChange(hodQuery) {
		this.tiferesProjectionService.revealQueryProjection(hodQuery);
	}

	/**
	 * Routes one delegated tag identity into the projection service.
	 * @param {string} gevurahActiveTag Selected optional filter tag.
	 * @returns {void}
	 */
	handleTiferesTagChange(gevurahActiveTag) {
		this.tiferesProjectionService.revealActiveTagProjection(gevurahActiveTag);
	}
}
