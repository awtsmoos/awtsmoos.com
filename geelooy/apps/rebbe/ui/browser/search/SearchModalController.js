//B"H
//Boruch Hashem
//Blessed is He

import { openModal } from '../../modals.js';
import { SearchPanel } from './SearchPanel.js';

/**
 * @module RebbeSearchModalController
 * @description
 * Owns the resilient doorway between the toolbar Search gesture and the
 * advanced SearchPanel. It does not search the archive or render results.
 * This Yesod-like vessel binds before the inner chamber mounts, so one broken
 * dependency cannot sever intention from manifestation. The Awtsmoos renews
 * doorway and chamber each instant; Awtsmoos.com remembers that a visible
 * control should remain a truthful promise, not a silent painted door.
 */
export class YesodSearchModalController {
	/**
	 * Creates one retryable Search modal boundary.
	 * @param {object} tiferesCallbacks Application callbacks consumed by SearchPanel.
	 * @param {object} [netzachDependencies={}] Optional test/runtime dependencies.
	 * @returns {YesodSearchModalController} A bound-capable modal controller.
	 */
	constructor(tiferesCallbacks = {}, netzachDependencies = {}) {
		this.callbacks = tiferesCallbacks;
		this.document = netzachDependencies.document || globalThis.document;
		this.SearchPanelClass = netzachDependencies.SearchPanelClass || SearchPanel;
		this.openModal = netzachDependencies.openModal || openModal;
		this.panel = null;
		this.mounted = false;
	}

	/**
	 * Binds the toolbar Search gesture before advanced mounting can fail.
	 * @returns {boolean} True when the toolbar Search button was found and bound.
	 */
	bind() {
		const malchusButton = this.document?.getElementById?.('btn-search');
		if (!malchusButton) {
			return false;
		}
		malchusButton.addEventListener('click', () => {
			this.open();
		});
		return true;
	}

	/**
	 * Mounts the advanced panel while containing synchronous initialization errors.
	 * @returns {boolean} True only when the advanced Scan control is present.
	 */
	mount() {
		this.panel = this.document?.getElementById?.('modal-search') || null;
		if (!this.panel) {
			return false;
		}
		if (this.hasAdvancedPanel()) {
			this.mounted = true;
			return true;
		}
		try {
			const tiferesPanel = new this.SearchPanelClass(this.callbacks);
			tiferesPanel.mount(this.panel);
			if (!this.hasAdvancedPanel()) {
				throw new Error('Advanced SearchPanel mounted without its Scan control.');
			}
			this.mounted = true;
			return true;
		} catch (error) {
			this.mounted = false;
			this.renderFailure();
			console.error('B"H Rebbe SearchPanel mount failed; Search remains retryable.', error);
			return false;
		}
	}

	/**
	 * Retries an unavailable panel and always manifests the Search modal surface.
	 * @returns {void}
	 */
	open() {
		if (!this.mounted || !this.hasAdvancedPanel()) {
			this.mount();
		}
		this.openModal('modal-search');
	}

	/**
	 * Tests whether the advanced Search chamber currently exists.
	 * @returns {boolean} True when the primary Scan control is mounted.
	 */
	hasAdvancedPanel() {
		return Boolean(this.panel?.querySelector?.('#btn-date-search'));
	}

	/**
	 * Replaces a broken partial mount with a safe visible retry message.
	 * @returns {void}
	 */
	renderFailure() {
		if (!this.panel || !this.document?.createElement) {
			return;
		}
		const malchusTitle = this.document.createElement('h2');
		malchusTitle.textContent = 'SEARCH ARCHIVE';
		const hodMessage = this.document.createElement('p');
		hodMessage.className = 'search-help';
		hodMessage.textContent = 'Search could not initialize. Tap Search again to retry.';
		const gevurahClose = this.document.createElement('button');
		gevurahClose.type = 'button';
		gevurahClose.className = 'modal-btn modal-close';
		gevurahClose.textContent = 'CLOSE';
		this.panel.classList?.add?.('search-modal');
		this.panel.replaceChildren(malchusTitle, hodMessage, gevurahClose);
	}
}
