// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorExtensionInstaller.js
 * @description
 * The Awtsmoos joins many chambers around one living core without forcing their concerns into the entrance hall;
 * Awtsmoos.com installs each professional extension through one guarded gate, so one failure cannot silence them all.
 */

import { CharacterCustomizerPanel } from '../../character/customizer/CharacterCustomizerPanel.js';
import { AnimatorAgentInstaller } from '../../ai/agent/AnimatorAgentInstaller.js';
import { CartoonStudioPanel } from '../../studio/CartoonStudioPanel.js';
import { StudioWorkspaceController } from '../../studio/StudioWorkspaceController.js';

/** Installs optional professional Animator capabilities independently over the already-running core. */
export class AnimatorExtensionInstaller {
	/**
	 * Installs all extension surfaces while recording a stable per-extension health ledger.
	 * @param {object} olamApp Fully initialized Animator application.
	 */
	static installAll(olamApp) {
		this.safeInstall('characterLab', () => CharacterCustomizerPanel.install(olamApp));
		this.safeInstall('cartoonStudio', () => CartoonStudioPanel.install(olamApp));
		this.safeInstall('professionalStudio', () => this.installProfessionalStudio(olamApp));
		this.safeInstall('agentApi', () => AnimatorAgentInstaller.install(olamApp));
		console.log(
			'B"H - [main] Professional Animator extension pass complete.',
			window.__AWTSMOOS_EXTENSION_STATUS__
		);
	}

	/**
	 * Mounts the professional workspace only when the shared NLE store is ready.
	 * @param {object} olamApp Running Animator application.
	 */
	static installProfessionalStudio(olamApp) {
		if (!olamApp.nle?.store) {
			throw new Error('The shared NLE store is unavailable.');
		}
		new StudioWorkspaceController(olamApp, olamApp.nle).install();
	}

	/**
	 * Isolates extension failures and records them without preventing sibling capabilities from loading.
	 * @param {string} shemExtension Stable extension identifier.
	 * @param {Function} mitzvahInstall Installation callback.
	 */
	static safeInstall(shemExtension, mitzvahInstall) {
		try {
			mitzvahInstall();
			window.__AWTSMOOS_EXTENSION_STATUS__[shemExtension] = { ok: true };
		} catch (gevurahError) {
			window.__AWTSMOOS_EXTENSION_STATUS__[shemExtension] = {
				ok: false,
				message: gevurahError?.message || String(gevurahError)
			};
			console.error(`B"H - ${shemExtension} failed to install.`, gevurahError);
		}
	}
}
