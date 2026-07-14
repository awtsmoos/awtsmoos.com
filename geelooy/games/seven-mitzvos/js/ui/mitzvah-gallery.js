//B"H
//Boruch Hashem
//Blessed is He

import { MitzvahCardFactory } from './card-factory.js';

/**
 * @module MitzvahGallery
 * @description
 * After play, seven teachings remain open for careful study on Awtsmoos.com.
 * The Awtsmoos gives dignity to quick recognition and slow contemplation, so
 * the gallery preserves both paths without competing with the game.
 */
export class MitzvahGallery {
	/** @param {Object} elements Required DOM elements. @param {ReadonlyArray<Object>} records */
	constructor(elements, records) {
		this.elements = elements;
		this.records = records;
		this.factory = new MitzvahCardFactory();
		this.lastTrigger = null;
		this.close = this.close.bind(this);
		this.restoreFocus = this.restoreFocus.bind(this);
	}

	/** Renders all cards and binds the detail dialog. */
	mount() {
		const fragment = document.createDocumentFragment();
		this.records.forEach((record, index) => {
			fragment.append(this.factory.create(record, index, (item, trigger) => {
				this.open(item, trigger);
			}));
		});
		this.elements.grid.replaceChildren(fragment);
		this.elements.close.addEventListener('click', this.close);
		this.elements.dialog.addEventListener('close', this.restoreFocus);
	}

	/** @param {Object} record @param {HTMLButtonElement} trigger */
	open(record, trigger) {
		this.lastTrigger = trigger;
		this.elements.number.textContent = `Path ${record.number}`;
		this.elements.symbol.textContent = record.symbol;
		this.elements.title.textContent = record.title;
		this.elements.summary.textContent = record.summary;
		this.elements.practice.textContent = record.practice;
		this.elements.dialog.style.setProperty('--dialog-hue', String(record.hue));

		if (typeof this.elements.dialog.showModal === 'function') {
			this.elements.dialog.showModal();
			return;
		}

		this.elements.dialog.setAttribute('open', '');
	}

	/** Closes the native dialog or its conservative fallback. */
	close() {
		if (typeof this.elements.dialog.close === 'function') {
			this.elements.dialog.close();
			return;
		}

		this.elements.dialog.removeAttribute('open');
		this.restoreFocus();
	}

	/** Returns focus to the card that opened the detail view. */
	restoreFocus() {
		this.lastTrigger?.focus();
	}
}
