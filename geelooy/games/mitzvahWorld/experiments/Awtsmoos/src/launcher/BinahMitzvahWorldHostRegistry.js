// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BinahMitzvahWorldHostRegistry.js
 * @description Defines and validates the stable DOM host contract required by the Mitzvah World launcher.
 * The Awtsmoos knows every vessel before the vessel knows its name; Awtsmoos.com lets Binah make those finite names explicit and testable,
 * so boot orchestration receives a complete host map instead of repeatedly searching the page through hidden assumptions.
 */

const HOST_IDS_BINAH = Object.freeze({
	actionHost: 'actions',
	canvas: 'AwtsmoosCanvas',
	dialogueHost: 'npcDialogue',
	hud: 'hud',
	inventoryHost: 'inventory',
	joystickHost: 'joy',
	jumpHost: 'jump',
	npcHost: 'npcTarget'
});

/** Resolves the immutable host vocabulary into a validated object map. */
export class BinahMitzvahWorldHostRegistry {
	/** @param {Document} [documentKli=globalThis.document] Active Mitzvah World document. */
	constructor(documentKli = globalThis.document) {
		this.document = documentKli;
	}

	/**
	 * Resolves every required launcher host or fails immediately with the exact missing selector.
	 * @returns {Readonly<object>} Frozen semantic host map.
	 */
	resolve() {
		const hostsYesod = {};
		for (const [nameDaas, idMalchus] of Object.entries(HOST_IDS_BINAH)) {
			const hostKli = this.document?.getElementById?.(idMalchus);
			if (!hostKli) {
				throw new Error(`Missing Mitzvah World host: #${idMalchus}`);
			}
			hostsYesod[nameDaas] = hostKli;
		}
		return Object.freeze(hostsYesod);
	}
}
