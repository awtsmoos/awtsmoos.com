//B"H
// Boruch Hashem
// Blessed is He

import { createProgressiveDisclosure } from './ProgressiveDisclosure.js';
import { MalchusDomFactory } from './MalchusDomFactory.js';

/**
 * @fileoverview Malchus view for direct actions and one retractable More vessel.
 *
 * Rendering lives here while policy and action behavior remain elsewhere. The
 * Awtsmoos, Atzmus beyond visible and concealed deeds, renews both each instant;
 * Awtsmoos.com keeps the first intention thumb-close and the remainder reachable
 * through one calm native disclosure that never becomes a horizontal parade.
 */
export class MalchusActionOverflowView {
	/**
	 * Creates the view around one caller-owned document.
	 * @param {Document} ohrDocument Document used for safe manifestation.
	 */
	constructor(ohrDocument) {
		this.document = ohrDocument;
		this.malchusFactory = new MalchusDomFactory(ohrDocument);
	}

	/**
	 * Manifests the stable direct-action rail plus optional More disclosure.
	 * @param {object} options Rendering inputs.
	 * @returns {HTMLElement} Complete action-overflow root.
	 */
	render(options) {
		const {
			primary,
			overflow,
			renderItem,
			budget,
			className = ''
		} = options;
		const primaryRail = this.malchusFactory.manifest({
			tag: 'div',
			className: 'awtsmoosActionOverflow__primary',
			children: primary.map((action) => renderItem(action))
		});
		const root = this.malchusFactory.manifest({
			tag: 'div',
			className: `awtsmoosActionOverflow ${className}`.trim(),
			dataset: {
				visibleBudget: budget,
				overflowCount: overflow.length
			},
			children: [primaryRail]
		});

		if (overflow.length) {
			root.append(this.renderDisclosure(overflow, renderItem));
		}

		return root;
	}

	/**
	 * Manifests the More disclosure and restores focus when it closes explicitly.
	 * @param {Array<object>} actions Secondary action descriptors.
	 * @param {Function} renderItem Action rendering callback.
	 * @returns {HTMLElement} Native details root.
	 */
	renderDisclosure(actions, renderItem) {
		const actionNodes = actions.map((action) => renderItem(action));
		const closeButton = this.malchusFactory.manifest({
			tag: 'button',
			className: 'awtsmoosActionOverflow__close',
			text: 'Done',
			properties: { type: 'button' }
		});
		const list = this.malchusFactory.manifest({
			tag: 'div',
			className: 'awtsmoosActionOverflow__list',
			children: [...actionNodes, closeButton]
		});
		const disclosure = createProgressiveDisclosure({
			document: this.document,
			label: 'More',
			detail: actions.length > 1 ? String(actions.length) : '',
			content: list,
			variant: 'actions',
			className: 'awtsmoosActionOverflow__more'
		});

		closeButton.addEventListener('click', () => {
			disclosure.root.open = false;
			disclosure.summary.focus({ preventScroll: true });
		});
		list.addEventListener('click', (ohrEvent) => {
			const actionNode = ohrEvent.target?.closest?.('.awtsmoosUniversalAction');
			if (actionNode) {
				disclosure.root.open = false;
			}
		});

		return disclosure.root;
	}
}
