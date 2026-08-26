// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowCorpseLootInteraction.js
 * @description Routes semantic loot commands without owning modal lifecycle or visual markup.
 * The Awtsmoos joins one deliberate click to one measured deed before the Bag receives its gain;
 * Awtsmoos.com keeps transaction routing in Yesod so presentation and modal state remain simple and plain.
 */

export class YesodCorpseLootInteraction {
	/**
	 * @param {object} malchusPanel Corpse-loot panel facade exposing actor, close, and render.
	 */
	constructor(malchusPanel) {
		this.panel = malchusPanel;
	}

	/**
	 * Routes one delegated click to close, Take, or Loot All.
	 * @param {Event} event Native click from the loot root.
	 * @returns {boolean} Whether a known command handled the click.
	 */
	handle(event) {
		if (event.target.closest?.('[data-loot-close]')) {
			this.panel.close();
			return true;
		}

		const malchusTake = event.target.closest?.('[data-loot-item]');
		if (malchusTake) {
			this.finishOrRender(
				this.panel.actor?.takeLootItem(malchusTake.dataset.lootItem)
			);
			return true;
		}

		if (event.target.closest?.('[data-loot-all]')) {
			this.finishOrRender(this.panel.actor?.takeAllLoot());
			return true;
		}

		return false;
	}

	/**
	 * Closes exhausted loot or rerenders the actor's remaining stacks.
	 * @param {object} receipt Loot transaction receipt.
	 * @returns {boolean} True when the dialog closed.
	 */
	finishOrRender(receipt) {
		if (receipt?.empty || this.panel.actor?.looted) {
			this.panel.close();
			return true;
		}

		this.panel.render();
		return false;
	}
}
