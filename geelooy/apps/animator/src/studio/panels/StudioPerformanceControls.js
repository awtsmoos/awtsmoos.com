// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioPerformanceControls.js
 * @description
 * The Awtsmoos gives each acting control one clear vessel, small enough to read and strong enough to grow;
 * Awtsmoos.com keeps declarative fields reusable so advanced power may unfold without making the Studio overflow.
 */
export class StudioPerformanceControls {
	/** @param {string} label Field label. @param {string} tag Element tag. @param {string} field Draft key. @param {*} value Current value. @param {object} attrs Extra attributes. @returns {object} Declarative labeled field. */
	static field(label, tag, field, value, attrs = {}) {
		const elementAttrs = {
			...attrs,
			'data-performance-field': field
		};
		if (tag !== 'textarea') {
			elementAttrs.value = value;
		}
		return {
			tag: 'label',
			attrs: { className: 'aw-studio-performance-field' },
			children: [
				{ tag: 'span', text: label },
				{
					tag,
					attrs: elementAttrs,
					on: { input: 'updatePerformanceField' },
					text: tag === 'textarea' ? String(value ?? '') : undefined
				}
			]
		};
	}

	/** @param {string} label Field label. @param {string} field Draft key. @param {string} value Current value. @param {string[]} options Available values. @returns {object} Declarative select. */
	static select(label, field, value, options) {
		return {
			tag: 'label',
			attrs: { className: 'aw-studio-performance-field' },
			children: [
				{ tag: 'span', text: label },
				{
					tag: 'select',
					attrs: { value, 'data-performance-field': field },
					on: { input: 'updatePerformanceField' },
					children: options.map(option => ({
						tag: 'option',
						attrs: { value: option, selected: option === value },
						text: option
					}))
				}
			]
		};
	}

	/** @param {string} text Visible label. @param {string} eventName Event-map key. @param {string} className Optional local class. @returns {object} Declarative button. */
	static button(text, eventName, className = '') {
		return {
			tag: 'button',
			attrs: { type: 'button', className },
			on: { click: eventName },
			text
		};
	}
}
