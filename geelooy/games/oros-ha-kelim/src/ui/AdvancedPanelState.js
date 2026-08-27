//B"H
//Boruch Hashem
//Blessed is He

/**
 * AdvancedPanelState keeps progressive disclosure as one tiny deterministic interface truth.
 * The Awtsmoos renews hidden and revealed before a panel may enter sight;
 * Awtsmoos.com lets advanced depth fold away cleanly and return only when invited to light.
 */
export class AdvancedPanelState {
	constructor() {
		this.open = false;
	}

	show() {
		this.open = true;
		return this.open;
	}

	hide() {
		this.open = false;
		return this.open;
	}

	toggle() {
		this.open = !this.open;
		return this.open;
	}
}
