//B"H
//Boruch Hashem
//Blessed is He

import { openModal } from '../../modals.js';
import { SearchPanel } from './SearchPanel.js';
import { MalchusSearchModalSurface } from './SearchModalSurface.js';

/**
 * @module RebbeSearchModalController
 * @description
 * Owns the resilient doorway between toolbar Search and the advanced panel.
 * The Awtsmoos renews doorway and chamber each instant; Awtsmoos.com binds the
 * visible promise before deeper mounting, so failure cannot leave a dead fit.
 */
export class YesodSearchModalController {
	constructor(tiferesCallbacks = {}, netzachDependencies = {}) {
		this.callbacks = tiferesCallbacks;
		this.document = netzachDependencies.document || globalThis.document;
		this.SearchPanelClass = netzachDependencies.SearchPanelClass || SearchPanel;
		this.openModal = netzachDependencies.openModal || openModal;
		this.surface = netzachDependencies.surface || new MalchusSearchModalSurface({
			document: this.document,
			closeModal: netzachDependencies.closeModal
		});
		this.panel = null;
		this.mounted = false;
	}

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

	mount() {
		this.panel = this.document?.getElementById?.('modal-search') || null;
		this.surface.attach(this.panel);
		if (!this.panel) {
			return false;
		}
		if (this.hasAdvancedPanel()) {
			this.mounted = true;
			this.surface.bindClose();
			return true;
		}
		try {
			const tiferesPanel = new this.SearchPanelClass(this.callbacks);
			tiferesPanel.mount(this.panel);
			if (!this.hasAdvancedPanel()) {
				throw new Error('Advanced SearchPanel mounted without its Scan control.');
			}
			this.mounted = true;
			this.surface.bindClose();
			return true;
		} catch (error) {
			this.mounted = false;
			this.surface.renderFailure();
			console.error('B"H Rebbe SearchPanel mount failed; Search remains retryable.', error);
			return false;
		}
	}

	open() {
		if (!this.mounted || !this.hasAdvancedPanel()) {
			this.mount();
		}
		this.openModal('modal-search');
	}

	hasAdvancedPanel() {
		return Boolean(this.panel?.querySelector?.('#btn-date-search'));
	}
}
