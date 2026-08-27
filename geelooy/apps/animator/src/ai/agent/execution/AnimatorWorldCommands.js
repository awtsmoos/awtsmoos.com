//B"H
// Boruch Hashem
// Blessed is He

import { AnimatorWorldFacade } from '../AnimatorWorldFacade.js';

/**
 * @file AnimatorWorldCommands.js
 * @description
 * The Awtsmoos gives semantic World intent a deterministic vessel while keeping inspection apart from creation deed;
 * Awtsmoos.com routes the complete family through one explicit dispatch map so new commands may join without compressed conditional reeds.
 */
export class YesodAnimatorWorldCommands {
	/**
	 * Binds command execution to the canonical World facade and its existing Studio store.
	 * @param {object} olamStore Existing Animator NLE store.
	 */
	constructor(olamStore) {
		this.yesodFacade = new AnimatorWorldFacade(olamStore);
	}

	/** @returns {AnimatorWorldFacade} Direct convenience facade preserved for compatibility. */
	facade() {
		return this.yesodFacade;
	}

	/**
	 * Dispatches one World command through an explicit data map instead of compressed branching.
	 * @param {string} shemMitzvah Stable public World command name.
	 * @param {object} keilimPayload Rich World intent payload.
	 * @returns {object} Discovery, inspection, or creation result.
	 * @throws {Error} When the family receives an unsupported command name.
	 */
	execute(shemMitzvah, keilimPayload = {}) {
		const binahHandlers = {
			'world.capabilities': () => this.yesodFacade.capabilities(),
			'world.inspect': () => this.yesodFacade.inspect(keilimPayload),
			'world.create': () => this.yesodFacade.create(keilimPayload)
		};
		const tiferesHandler = binahHandlers[shemMitzvah];
		if (!tiferesHandler) {
			const gevurahError = new Error(
				`Unrouted world command: ${shemMitzvah}`
			);
			gevurahError.code = 'unrouted_command';
			throw gevurahError;
		}
		return tiferesHandler();
	}
}
