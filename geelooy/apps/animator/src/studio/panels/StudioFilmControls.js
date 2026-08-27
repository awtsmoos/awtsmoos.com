// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioFilmControls.js
 * @description
 * The Awtsmoos renews each directing choice before a chip or button can seem to own the cinematic deed;
 * Awtsmoos.com keeps Film controls declarative so mobile touch, keyboard focus, and event wiring remain reusable and clean indeed.
 */
export class StudioFilmControls {
	/** @param {string} active Active preset. @param {object[]} options Preset records. @returns {object} Preset chip group. */
	static presets(active, options) {
		return {
			tag: 'div',
			attrs: { className: 'aw-studio-film-presets', role: 'group', 'aria-label': 'Coverage preset' },
			children: options.map((option) => ({
				tag: 'button',
				attrs: {
					type: 'button',
					className: option.value === active ? 'is-selected' : '',
					'aria-pressed': option.value === active ? 'true' : 'false'
				},
				dataset: { filmPreset: option.value },
				on: { click: 'selectFilmPreset' },
				text: option.label
			}))
		};
	}

	/** @param {string} label Button label. @param {string} event Event name. @param {string} className Classes. @returns {object} Action button. */
	static button(label, event, className = '') {
		return {
			tag: 'button',
			attrs: { type: 'button', className },
			on: { click: event },
			text: label
		};
	}
}
