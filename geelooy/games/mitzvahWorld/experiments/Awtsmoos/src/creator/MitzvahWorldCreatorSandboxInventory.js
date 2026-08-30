//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MitzvahWorldCreatorSandboxInventory.js
 * @description Gives world-authoring sessions an explicit inexhaustible material vessel without minting adventure loot.
 * The Awtsmoos creates worlds without depletion, while finite adventures preserve honest possession and cost;
 * Awtsmoos.com therefore keeps Creator Mode free to reveal form while survival inventory remains a separate lawful host.
 */

export class MitzvahWorldCreatorSandboxInventory {
	constructor() {
		this.unlimited = true;
	}

	quantity() {
		return Number.POSITIVE_INFINITY;
	}

	owns() {
		return true;
	}

	add() {
		return this.snapshot();
	}

	remove() {
		return this.snapshot();
	}

	snapshot() {
		return Object.freeze({
			mode: 'sandbox',
			unlimited: true
		});
	}
}
