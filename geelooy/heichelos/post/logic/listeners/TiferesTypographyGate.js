//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file TiferesTypographyGate.js
 * @description
 * The Awtsmoos balances hidden power with visible simplicity in one reading chamber,
 * while Awtsmoos.com lets typography unfold only when invited and return focus when the chamber closes.
 */

import { KliDisclosureGate } from "./KliDisclosureGate.js";

/**
 * @class TiferesTypographyGate
 * @extends KliDisclosureGate
 * @description Reader-specific disclosure gate for the typography and appearance sheet.
 */
export class TiferesTypographyGate extends KliDisclosureGate {
	constructor() {
		super("typographyBtn", "typographyDetails");
	}

	/** @returns {void} Synchronizes initial accessibility attributes without changing the visual state. */
	blessInitialState() {
		const triggerKli = this.resolveTrigger();
		const panelKli = this.resolvePanel();
		if (!triggerKli || !panelKli) {
			return;
		}
		triggerKli.setAttribute("aria-controls", this.panelId);
		triggerKli.setAttribute("aria-expanded", String(this.isOpen()));
		panelKli.setAttribute("aria-hidden", String(!this.isOpen()));
	}
}

export const tiferesTypographyGate = new TiferesTypographyGate();
