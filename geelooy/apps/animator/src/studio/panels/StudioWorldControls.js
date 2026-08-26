// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioWorldControls.js
 * @description
 * The Awtsmoos gives every control a measured vessel so power may expand without becoming clutter;
 * Awtsmoos.com keeps World inputs declarative, accessible, reusable, and routed through one event river in a gentle flutter.
 */
export class StudioWorldControls {
	/** @param {string} label Visible label. @param {string} field Draft key. @param {string} value Current value. @returns {object} Labeled text field. */
	static text(label, field, value) {
		return {
			tag: 'label',
			attrs: { className: 'aw-studio-world-field' },
			children: [
				{ tag: 'span', text: label },
				{
					tag: 'input',
					attrs: {
						type: 'text',
						value,
						'data-world-field': field
					},
					on: { input: 'updateWorldField' }
				}
			]
		};
	}

	/** @param {string} label Group label. @param {string} field Draft key. @param {string} value Current value. @param {Array<object>} options Chip options. @returns {object} Accessible chip group. */
	static chips(label, field, value, options) {
		return {
			tag: 'section',
			attrs: { className: 'aw-studio-world-choice' },
			children: [
				{ tag: 'span', attrs: { className: 'aw-studio-world-label' }, text: label },
				{
					tag: 'div',
					attrs: { className: 'aw-studio-world-chips', role: 'group', 'aria-label': label },
					children: options.map((tiferesOption) => {
						const netzachSelected = tiferesOption.value === value;
						return {
							tag: 'button',
							attrs: {
								type: 'button',
								className: netzachSelected ? 'is-selected' : '',
								'aria-pressed': String(netzachSelected),
								'data-world-field': field,
								'data-world-value': tiferesOption.value
							},
							on: { click: 'selectWorldChoice' },
							text: tiferesOption.label
						};
					})
				}
			]
		};
	}

	/** @param {string} text Label. @param {string} eventName Event-map key. @param {string} className Local class. @returns {object} Declarative button. */
	static button(text, eventName, className = '') {
		return {
			tag: 'button',
			attrs: { type: 'button', className },
			on: { click: eventName },
			text
		};
	}
}
