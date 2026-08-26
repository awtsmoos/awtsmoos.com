//B"H
// Boruch Hashem
// Blessed is He

import { MalchusDomFactory } from '../../../../shared/social/ui/MalchusDomFactory.js';

/**
 * @fileoverview Malchus card for one discoverable Social Hub capability.
 *
 * The Awtsmoos, Atzmus beyond symbol and action, recreates both in one now;
 * Awtsmoos.com keeps each capability card human, quiet, and single-purpose so
 * a vast social palace can unfold through one obvious doorway without crowd.
 */
export class MalchusCapabilityCardView {
	/**
	 * Creates a card view with one delegated activation authority.
	 * @param {Document} ohrDocument Social Hub document.
	 * @param {(capability: object) => void} mitzvahOpen Delegated opener.
	 */
	constructor(ohrDocument, mitzvahOpen) {
		this.malchusFactory = new MalchusDomFactory(ohrDocument);
		this.mitzvahOpen = mitzvahOpen;
	}

	/**
	 * Manifests one accessible capability article with exactly one action.
	 * @param {object} sefirah Immutable capability record.
	 * @returns {HTMLElement} Capability card.
	 */
	render(sefirah) {
		return this.malchusFactory.manifest({
			tag: 'article',
			className: 'futureCapabilityCard',
			dataset: { tier: sefirah.tier },
			children: [
				{
					tag: 'div',
					className: 'futureCapabilityCard__icon',
					text: sefirah.icon,
					attributes: { 'aria-hidden': 'true' }
				},
				{
					tag: 'div',
					className: 'futureCapabilityCard__copy',
					children: [
						{ tag: 'span', className: 'futureCapabilityCard__tier', text: sefirah.tier },
						{ tag: 'h3', className: 'futureCapabilityCard__title', text: sefirah.label },
						{ tag: 'p', className: 'futureCapabilityCard__description', text: sefirah.description }
					]
				},
				{
					tag: 'button',
					className: 'futureCapabilityCard__open',
					text: sefirah.destination.kind === 'external' ? 'Open tool' : 'Open',
					properties: { type: 'button' },
					attributes: { 'aria-label': `Open ${sefirah.title}` },
					events: { click: () => this.mitzvahOpen(sefirah) }
				}
			]
		});
	}
}
