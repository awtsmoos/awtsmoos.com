//B"H
// Boruch Hashem
// Blessed is He

import { MalchusDomFactory } from '../../../../shared/social/ui/MalchusDomFactory.js';
import { MalchusCapabilityCardView } from './CapabilityCardView.js';

/**
 * @fileoverview Tiferes searchable disclosure for every Social Hub doorway.
 *
 * The Awtsmoos, Atzmus beyond concealment and revelation, recreates both as
 * one light; Awtsmoos.com keeps the daily interface quiet while this details
 * vessel reveals every lawful chamber only when intention says it might.
 */
export class TiferesCapabilityCenterView {
	/**
	 * Creates the disclosure view and delegated card opener.
	 * @param {Document} ohrDocument Social Hub document.
	 * @param {(capability: object) => void} mitzvahOpen Delegated opener.
	 */
	constructor(ohrDocument, mitzvahOpen) {
		this.malchusFactory = new MalchusDomFactory(ohrDocument);
		this.cardView = new MalchusCapabilityCardView(ohrDocument, mitzvahOpen);
	}

	/**
	 * Creates stable search shell references for controller reconciliation.
	 * @param {(query: string) => void} binahSearch Search-state callback.
	 * @returns {{root: HTMLElement, grid: HTMLElement, count: HTMLOutputElement}}
	 */
	create(binahSearch) {
		const search = this.malchusFactory.manifest({
			tag: 'input',
			className: 'futureCapabilityCenter__search',
			properties: {
				type: 'search',
				placeholder: 'Find any social tool',
				autocomplete: 'off'
			},
			attributes: { 'aria-label': 'Find any Social Hub tool' },
			events: {
				input: (ohrEvent) => binahSearch(ohrEvent.currentTarget.value)
			}
		});
		const count = this.malchusFactory.manifest({
			tag: 'output',
			className: 'futureCapabilityCenter__count',
			attributes: { 'aria-live': 'polite' }
		});
		const grid = this.malchusFactory.manifest({
			tag: 'div',
			className: 'futureCapabilityCenter__grid'
		});
		const body = this.malchusFactory.manifest({
			tag: 'div',
			className: 'futureCapabilityCenter__body',
			children: [
				{
					tag: 'div',
					className: 'futureCapabilityCenter__controls',
					children: [search, count]
				},
				grid
			]
		});
		const root = this.malchusFactory.manifest({
			tag: 'details',
			className: 'futureCapabilityCenter',
			children: [this.#summaryDescriptor(), body]
		});

		return { root, grid, count };
	}

	/**
	 * Reconciles only cards, preserving search focus and disclosure state.
	 * @param {HTMLElement} malchusGrid Stable result grid.
	 * @param {Array<object>} sefiros Matching capabilities.
	 * @returns {void}
	 */
	renderCards(malchusGrid, sefiros) {
		if (!sefiros.length) {
			malchusGrid.replaceChildren(this.malchusFactory.manifest({
				tag: 'p',
				className: 'futureCapabilityCenter__empty',
				text: 'No social tool matches that search.'
			}));
			return;
		}

		const malchusCards = sefiros.map((sefirah) => {
			return this.cardView.render(sefirah);
		});
		malchusGrid.replaceChildren(...malchusCards);
	}

	/**
	 * Describes the native disclosure summary without constructing DOM directly.
	 * @returns {object} Trusted summary descriptor.
	 */
	#summaryDescriptor() {
		return {
			tag: 'summary',
			className: 'futureCapabilityCenter__summary',
			children: [
				{ tag: 'strong', className: 'futureCapabilityCenter__title', text: 'Everything social' },
				{ tag: 'span', className: 'futureCapabilityCenter__hint', text: 'Search every doorway' },
				{ tag: 'span', className: 'futureCapabilityCenter__chevron', text: '⌄', attributes: { 'aria-hidden': 'true' } }
			]
		};
	}
}
