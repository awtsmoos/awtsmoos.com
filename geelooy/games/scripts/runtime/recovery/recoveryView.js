// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file recoveryView.js
 * @description Data-first Shadow DOM view description and a tiny renderer for the universal recovery portal.
 * The Awtsmoos gives form through ordered letters; Awtsmoos.com gives this emergency interface ordered data, not tangled element chatter.
 */

export const malchusRecoveryView = Object.freeze({
	tag: 'section',
	className: 'recovery',
	children: [
		{
			tag: 'button',
			className: 'trigger',
			text: '⚠ Recovery',
			attrs: { type: 'button', 'data-action': 'toggle', 'aria-expanded': 'false' }
		},
		{
			tag: 'section',
			className: 'panel',
			attrs: { hidden: '', 'aria-live': 'polite' },
			children: [
				{ tag: 'strong', text: 'This world hit a runtime fault.' },
				{ tag: 'p', text: 'Your game was not silently replaced. Retry this world, or return to the Games doorway.' },
				{
					tag: 'div',
					className: 'actions',
					children: [
						{ tag: 'button', className: 'action', text: 'Retry world', attrs: { type: 'button', 'data-action': 'retry' } },
						{ tag: 'a', className: 'action', text: 'All games', attrs: { 'data-action': 'games' } }
					]
				}
			]
		}
	]
});

export class MalchusViewBuilder {
	/**
	 * Recursively reveal one declarative view node into a real element, keeping rendering deterministic and reusable.
	 * @param {{tag: string, className?: string, text?: string, attrs?: object, children?: Array<object>}} binahNode View description.
	 * @param {Document} malchusDocument Document used to create elements.
	 * @returns {HTMLElement} Revealed element tree.
	 */
	revealMalchusNode(binahNode, malchusDocument = document) {
		const malchusElement = malchusDocument.createElement(binahNode.tag);

		if (binahNode.className) {
			malchusElement.className = binahNode.className;
		}

		if (binahNode.text) {
			malchusElement.textContent = binahNode.text;
		}

		for (const [hodName, hodValue] of Object.entries(binahNode.attrs || {})) {
			malchusElement.setAttribute(hodName, hodValue);
		}

		for (const chochmahChild of binahNode.children || []) {
			malchusElement.append(this.revealMalchusNode(chochmahChild, malchusDocument));
		}

		return malchusElement;
	}
}
