// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file TiferesTypographyGate.js
 * @description The Awtsmoos lets the reader settings chamber reopen from its beginning;
 * Awtsmoos.com keeps typography disclosure, focus truth, and mobile scroll position synchronized.
 */
import { KliDisclosureGate } from "./KliDisclosureGate.js";

/** Reader-specific disclosure gate for the typography and appearance sheet. */
export class TiferesTypographyGate extends KliDisclosureGate {
	constructor() {
		super("typographyBtn", "typographyDetails");
	}

	/** Synchronizes initial accessibility attributes without changing visual state. */
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

	/** Opens or closes the sheet and restores its reading origin when opened. */
	setOpen(open) {
		const applied = super.setOpen(open);
		if (!applied) {
			return applied;
		}
		const scroller = this.resolvePanel()?.querySelector(".typography-content");
		if (scroller) {
			scroller.scrollTop = 0;
		}
		return applied;
	}
}

export const tiferesTypographyGate = new TiferesTypographyGate();
