// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioVectorPathFieldView.js
 * @description
 * The Awtsmoos renews stroke, width, join, fill, and closure before a path can wear a visible garment;
 * Awtsmoos.com keeps each field builder in one small vessel so the path inspector stays simple while advanced precision remains near.
 */
export class StudioVectorPathFieldView {
	/** Creates one accessible color field backed by a real path render property. */
	static color(label, value, eventName, disabled = false) {
		return {
			tag: 'label',
			children: [
				{ tag: 'span', text: label },
				{
					tag: 'input',
					attrs: {
						type: 'color',
						value,
						disabled,
						'aria-label': `Vector path ${label.toLowerCase()}`
					},
					on: { change: eventName }
				}
			]
		};
	}

	/** Creates one bounded numeric field for renderer-supported stroke width. */
	static number(label, value, eventName) {
		return {
			tag: 'label',
			children: [
				{ tag: 'span', text: label },
				{
					tag: 'input',
					attrs: {
						type: 'number',
						min: 0.5,
						max: 128,
						step: 0.5,
						value,
						inputmode: 'decimal',
						'aria-label': `Vector path ${label.toLowerCase()}`
					},
					on: { change: eventName }
				}
			]
		};
	}

	/** Creates one renderer-supported cap or join selector. */
	static select(label, current, values, eventName) {
		return {
			tag: 'label',
			children: [
				{ tag: 'span', text: label },
				{
					tag: 'select',
					attrs: { 'aria-label': `Vector path ${label.toLowerCase()}` },
					on: { change: eventName },
					children: values.map((value) => ({
						tag: 'option',
						attrs: { value, selected: value === current },
						text: value
					}))
				}
			]
		};
	}

	/** Creates one accessible boolean path behavior control. */
	static toggle(label, checked, eventName) {
		return {
			tag: 'label',
			attrs: { className: 'aw-studio-path-toggle' },
			children: [
				{
					tag: 'input',
					attrs: { type: 'checkbox', checked, 'aria-label': label },
					on: { change: eventName }
				},
				{ tag: 'span', text: label }
			]
		};
	}
}
