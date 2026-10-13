//B"H
//Boruch Hashem
//Blessed is He

/**
 * Builds the common back-to-mode button used by card grids. Kept import-free
 * so VS and menu screens stay in the boot graph without dragging adventure data.
 *
 * @returns {object} DOM-forge button description.
 */
export function gridBackButton() {
	return {
		tag: 'button',
		attrs: {
			class: 'backMenuButton',
			type: 'button',
			'data-menu-back': 'mode'
		},
		children: ['← Gates']
	};
}
