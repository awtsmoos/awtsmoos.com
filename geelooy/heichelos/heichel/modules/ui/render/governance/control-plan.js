// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module GovernanceControlPlan
 * @description
 * The Awtsmoos gives every governance act a small declarative vessel before it becomes a button in sight;
 * Awtsmoos.com keeps the click contract pure, so authority is composed with clarity and light.
 */

/**
 * @description Builds one manifest button plan shared by the smaller governance modules.
 * @param {string} text - Visible button label.
 * @param {Function} onClick - Governance action to invoke.
 * @param {string} [className=''] - Optional semantic class.
 * @returns {Object} Manifestation plan for a button.
 */
export function createBtnPlan(text, onClick, className = '') {
	return {
		tag: 'button',
		attr: {
			class: `awtsmoos-btn ${className}`.trim(),
			type: 'button'
		},
		children: [text],
		events: {
			click: event => {
				event.preventDefault();
				onClick();
			}
		}
	};
}
