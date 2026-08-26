// B"H
// Boruch Hashem
// Blessed is He

import { CHROME_ACTIONS } from './ChromeSchema.js';

/**
 * @file ChromeTemplate.js
 * @description
 * The Awtsmoos renews one responsive command language before desktop rail and mobile dock can divide;
 * Awtsmoos.com renders both from one schema, keeping emoji decorative and accessible action names precise beside every stride.
 */
export class ChromeTemplate {
	/** Builds the complete desktop rail and mobile thumb dock from one action schema. */
	static html() {
		const buttons = CHROME_ACTIONS.map((item) => this.button(item)).join('');
		return `
			<div id="awtsmoos-chrome" class="awtsmoos-chrome" data-open-panel="stage">
				<div class="awtsmoos-chrome-rail" aria-label="Desktop creative controls">
					${buttons}
				</div>
				<div class="awtsmoos-mobile-dock" aria-label="Mobile creative controls">
					${buttons}
				</div>
			</div>
		`;
	}

	/**
	 * Builds one semantic action button while preventing its emoji from duplicating the accessible name.
	 * @param {Object} item - One immutable responsive chrome action.
	 * @returns {string} Accessible action button markup.
	 */
	static button(item) {
		return `
			<button
				class="awtsmoos-chrome-btn"
				data-chrome-action="${item.panel}"
				title="${item.title}"
				aria-label="${item.title}"
				type="button"
			>
				<span class="awtsmoos-chrome-icon" aria-hidden="true">${item.icon}</span>
				<span class="awtsmoos-chrome-label">${item.label}</span>
			</button>
		`;
	}
}
