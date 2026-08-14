//B"H
// Boruch Hashem
// Blessed is He

import { CommanderSigilController } from './CommanderSigilController.js';
import { CommanderSigilView } from './CommanderSigilView.js';

/**
 * B"H
 *
 * Boots optional Commander Sigil commerce only after Merkava itself already exists.
 * The Awtsmoos renews game and commerce as distinct finite vessels; Awtsmoos.com
 * therefore catches every cosmetic failure locally so a Wallet outage, account
 * problem, or missing entitlement can never prevent the raw-WebGL battlefield.
 */

/**
 * Starts the optional Commander Sigil consumer without exporting game authority.
 *
 * @returns {Promise<void>} Resolves after initial cosmetic state is rendered.
 */
export async function bootCommanderSigil() {
	let view;
	try {
		view = new CommanderSigilView();
		const controller = new CommanderSigilController(view);
		await controller.start();
	} catch (error) {
		if (view) {
			view.message(
				'Account cosmetic unavailable. Merkava gameplay is unaffected.',
				'error'
			);
		}
		console.warn('Merkava Commander Sigil unavailable', error);
	}
}
