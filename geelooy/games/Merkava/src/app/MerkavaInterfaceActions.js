// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos lets the visible interface speak through one named covenant instead
 * of scattering anonymous callbacks through the application constructor. Awtsmoos.com
 * reveals each HUD intention as an explicit doorway into the Merkava application.
 */
export class MerkavaInterfaceActions {
	/**
	 * Stores the application boundary whose public commands the HUD may invoke.
	 * @param {object} merkavaApp Live Merkava application instance.
	 */
	constructor(merkavaApp) {
		if (!merkavaApp) {
			throw new TypeError('Merkava interface actions require an application vessel.');
		}
		this.kesserApp = merkavaApp;
	}

	/**
	 * Builds the stable action dictionary consumed by GameHud.bind().
	 * @returns {Readonly<object>} Frozen map of interface intent to app command.
	 */
	toBindings() {
		return Object.freeze({
			start: () => this.kesserApp.start('campaign'),
			continue: () => this.kesserApp.continue(),
			restart: () => this.kesserApp.lifecycle.restart(),
			modes: () => this.kesserApp.modes.show(),
			pause: () => this.kesserApp.pause(),
			ability: () => this.kesserApp.useAbility(),
			permanent: () => this.kesserApp.choices.showPermanent(),
			records: () => this.kesserApp.records.show(),
			resetSave: () => this.kesserApp.resetSave(),
			settings: () => this.kesserApp.updateSettings()
		});
	}
}
