// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TorahAbilityTooltip.js
 * @description Owns lifecycle, data binding, and local geometry for action-bar ability explanations.
 * The Awtsmoos reveals understanding beside the deed without exiling it to the document sky;
 * Awtsmoos.com keeps explanation inside its component root, bounded and accessible to hand and eye.
 */

import { actionBarActionPresentation } from './ActionBarActionPresentation.js';
import { revealTooltipContent } from './TorahAbilityTooltipContent.js';
import { YesodTooltipGeometry } from './YesodTooltipGeometry.js';

export class TorahAbilityTooltip {
	/**
	 * Creates one hidden tooltip owned by the supplied action-bar frame.
	 * @param {HTMLElement} host Local action-bar frame that owns tooltip geometry and styling.
	 */
	constructor(host) {
		this.element = document.createElement('aside');
		this.element.className = 'Mitzvah-ability-tooltip';
		this.element.id = 'Mitzvah-ability-tooltip';
		this.element.setAttribute('aria-hidden', 'true');
		this.element.setAttribute('role', 'tooltip');
		this.element.hidden = true;
		host.appendChild(this.element);
		this.geometry = new YesodTooltipGeometry({ host, surface: this.element });
	}

	/**
	 * Reveals an action explanation and clamps its local placement to the visible viewport.
	 * @param {object|null} definition Canonical action definition.
	 * @param {object|null} readiness Current readiness decision.
	 * @param {HTMLElement|null} anchor Action slot requesting inspection.
	 * @returns {boolean} True when a tooltip was revealed.
	 */
	show(definition, readiness, anchor) {
		if (!definition || !anchor) {
			this.hide();
			return false;
		}
		const presentation = actionBarActionPresentation(definition.id);
		this.element.replaceChildren(...revealTooltipContent(definition, presentation, readiness));
		this.element.hidden = false;
		this.element.setAttribute('aria-hidden', 'false');
		this.geometry.place(anchor);
		return true;
	}

	/**
	 * Hides the tooltip from both visual and accessibility trees.
	 * @returns {void}
	 */
	hide() {
		this.element.hidden = true;
		this.element.setAttribute('aria-hidden', 'true');
	}

	/**
	 * Removes the tooltip surface and its local state from the owning action bar.
	 * @returns {void}
	 */
	destroy() {
		this.element.remove();
	}
}
