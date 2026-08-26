//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file YesodStorefrontInteractionController.js
 * @description Owns search and delegated tag listener lifetime without owning filter state or rendering policy.
 * The Awtsmoos joins gesture and consequence beyond every event while Yesod carries only the signal that is due;
 * Awtsmoos.com uses delegation so regenerated tags never accumulate listeners and teardown remains explicitly true.
 */

/** Event-lifetime controller for search input and retracted tag cloud. */
export class YesodStorefrontInteractionController {
	/**
	 * @param {object} yesodDependencies Interaction dependencies.
	 * @param {HTMLInputElement|null} yesodDependencies.searchInput Search source.
	 * @param {HTMLElement|null} yesodDependencies.tagCloud Delegated tag source.
	 * @param {(hodQuery: string) => void} yesodDependencies.onQueryChange Query callback.
	 * @param {(gevurahTag: string) => void} yesodDependencies.onTagChange Tag callback.
	 */
	constructor({ searchInput, tagCloud, onQueryChange, onTagChange }) {
		this.yesodSearchInput = searchInput;
		this.yesodTagCloud = tagCloud;
		this.tiferesOnQueryChange = onQueryChange;
		this.tiferesOnTagChange = onTagChange;
		this.yesodConnected = false;
		this.handleYesodSearchInput = this.handleYesodSearchInput.bind(this);
		this.handleYesodTagClick = this.handleYesodTagClick.bind(this);
	}

	/** Connects each available listener once. @returns {void} */
	connect() {
		if (this.yesodConnected) {
			return;
		}

		this.yesodSearchInput?.addEventListener('input', this.handleYesodSearchInput);
		this.yesodTagCloud?.addEventListener('click', this.handleYesodTagClick);
		this.yesodConnected = true;
	}

	/** Disconnects all owned listeners without mutating storefront state. @returns {void} */
	disconnect() {
		if (!this.yesodConnected) {
			return;
		}

		this.yesodSearchInput?.removeEventListener('input', this.handleYesodSearchInput);
		this.yesodTagCloud?.removeEventListener('click', this.handleYesodTagClick);
		this.yesodConnected = false;
	}

	/** @param {Event} yesodInputEvent Browser input event. @returns {void} */
	handleYesodSearchInput(yesodInputEvent) {
		this.tiferesOnQueryChange(String(yesodInputEvent.currentTarget?.value || ''));
	}

	/**
	 * Resolves one delegated tag button from a nested click target and emits its tag identity.
	 * @param {Event} yesodClickEvent Browser click event.
	 * @returns {void}
	 */
	handleYesodTagClick(yesodClickEvent) {
		const malchusTagButton = yesodClickEvent.target?.closest?.('[data-storefront-tag]');
		if (!malchusTagButton || !this.yesodTagCloud?.contains(malchusTagButton)) {
			return;
		}

		this.tiferesOnTagChange(malchusTagButton.dataset.storefrontTag || 'All');
	}
}
