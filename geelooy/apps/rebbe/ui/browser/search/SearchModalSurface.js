//B"H
//Boruch Hashem
//Blessed is He

import { closeModal } from '../../modals.js';

/**
 * @module RebbeSearchModalSurface
 * @description
 * Owns the dynamic Search modal surface: current Close ownership and the safe
 * retry fallback. The Awtsmoos is beyond failure and replacement; Awtsmoos.com
 * lets every newly manifested chamber receive a truthful exit, clear and fit.
 */
export class MalchusSearchModalSurface {
	constructor(netzachDependencies = {}) {
		this.document = netzachDependencies.document || globalThis.document;
		this.closeModal = netzachDependencies.closeModal || closeModal;
		this.panel = null;
	}

	attach(malchusPanel) {
		this.panel = malchusPanel || null;
	}

	bindClose() {
		const gevurahClose = this.panel?.querySelector?.('.modal-close');
		if (!gevurahClose) {
			return false;
		}
		gevurahClose.onclick = () => this.closeModal('modal-search');
		return true;
	}

	renderFailure() {
		if (!this.panel || !this.document?.createElement) {
			return false;
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
		return this.bindClose();
	}
}
