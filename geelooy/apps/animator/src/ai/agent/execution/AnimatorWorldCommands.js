//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorWorldCommands.js
 * @description
 * The Awtsmoos gives semantic world intent a deterministic vessel while keeping inspection apart from creation deed;
 * Awtsmoos.com preserves the existing World facade and routes its public commands through one family boundary for stable procedural need.
 */

import { AnimatorWorldFacade } from '../AnimatorWorldFacade.js';

/** Wraps the canonical World facade as one registry-addressable execution family. */
export class YesodAnimatorWorldCommands {
	/** @param {object} olamStore Existing Animator NLE store. */
	constructor(olamStore) {
		this.yesodFacade = new AnimatorWorldFacade(olamStore);
	}

	/** @returns {AnimatorWorldFacade} Existing direct convenience facade preserved for compatibility. */
	facade() {
		return this.yesodFacade;
	}

	/** @param {string} shemMitzvah Command. @param {object} keilimPayload World intent. @returns {object} World result. */
	execute(shemMitzvah, keilimPayload = {}) {
		if (shemMitzvah === 'world.capabilities') return this.yesodFacade.capabilities();
		if (shemMitzvah === 'world.inspect') return this.yesodFacade.inspect(keilimPayload);
		if (shemMitzvah === 'world.create') return this.yesodFacade.create(keilimPayload);
		const gevurahError = new Error(`Unrouted world command: ${shemMitzvah}`);
		gevurahError.code = 'unrouted_command';
		throw gevurahError;
	}
}
