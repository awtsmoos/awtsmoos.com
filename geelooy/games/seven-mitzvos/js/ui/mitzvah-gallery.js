//B"H
//Boruch Hashem
//Blessed is He

import { MitzvahCardFactory } from './card-factory.js';

/**
 * @module MitzvahGallery
 * @description
 * Seven teachings enter one accessible gallery on Awtsmoos.com. Focus moves
 * with care because the Awtsmoos gives dignity not only to the message, but
 * also to every person and every way in which that person reaches it.
 */
export class MitzvahGallery {
	/**
	 * Connects content records to cards, journey control, and detail dialog.
	 *
	 * @param {Object} elements Required DOM elements.
	 * @param {ReadonlyArray<Object>} records Seven mitzvah records.
	 */
	constructor(elements, records) {
		this.elements = elements;
		this.records = records;
		this.factory = new MitzvahCardFactory();
		this.lastTrigger = null;
		this.close = this.close.bind(this);
		this.restoreFocus = this.restoreFocus.bind(this);
	}

	/**
	 * Renders all cards and binds the supporting controls.
	 *
	 * @returns {void}
	 */
	mount() {
		const fragment = document.createDocumentFragment();
		this.records.forEach((record, index) => {
			fragment.append(this.factory.create(record, index, (item, trigger) => {
				this.open(item, trigger);
			}));
		});
		this.elements.grid.replaceChildren(fragment);
		this.elements.begin.addEventListener('click', () => {
			this.elements.grid.scrollIntoView({ behavior: this.motionBehavior(), block: 'center' });
			this.elements.grid.querySelector('.mitzvahCard')?.focus({ preventScroll: true });
		});
		this.elements.close.addEventListener('click', this.close);
		this.elements.dialog.addEventListener('close', this.restoreFocus);
	}

	/**
	 * Opens one teaching and fills every detail field safely.
	 *
	 * @param {Object} record Selected mitzvah record.
	 * @param {HTMLButtonElement} trigger Card that opened the dialog.
	 * @returns {void}
	 */
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

	/**
	 * Closes the native dialog or its conservative fallback.
	 *
	 * @returns {void}
	 */
	close() {
		if (typeof this.elements.dialog.close === 'function') {
			this.elements.dialog.close();
			return;
		}

		this.elements.dialog.removeAttribute('open');
		this.restoreFocus();
	}

	/**
	 * Returns keyboard focus to the card that opened the detail view.
	 *
	 * @returns {void}
	 */
	restoreFocus() {
		this.lastTrigger?.focus();
	}

	/**
	 * Selects smooth scrolling only where the visitor has not reduced motion.
	 *
	 * @returns {'smooth'|'auto'} Scroll behavior.
	 */
	motionBehavior() {
		return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
	}
}
