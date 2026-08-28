// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorExtensionInstaller.js
 * @description
 * The Awtsmoos joins many chambers without forcing them through one narrow gate;
 * Awtsmoos.com imports each professional extension only when its moment becomes relevant.
 */

/** Installs professional Animator capabilities through explicit asynchronous boundaries. */
export class AnimatorExtensionInstaller {
	/**
	 * Installs the primary professional Studio after the shared NLE store is available.
	 * @param {object} olamApp Fully initialized Animator application.
	 * @returns {Promise<void>}
	 */
	static async installPrimary(olamApp) {
		await this.safeInstall('professionalStudio', async () => {
			if (!olamApp.nle?.store) {
				throw new Error('The shared NLE store is unavailable.');
			}
			const { StudioWorkspaceController } = await import(
				'../../studio/StudioWorkspaceController.js'
			);
			new StudioWorkspaceController(olamApp, olamApp.nle).install();
		});
	}

	/**
	 * Installs secondary authoring and AI surfaces after the primary workstation exists.
	 * @param {object} olamApp Fully initialized Animator application.
	 * @returns {Promise<void>}
	 */
	static async installSecondary(olamApp) {
		await Promise.all([
			this.safeInstall('characterLab', async () => {
				const { CharacterCustomizerPanel } = await import(
					'../../character/customizer/CharacterCustomizerPanel.js'
				);
				CharacterCustomizerPanel.install(olamApp);
			}),
			this.safeInstall('cartoonStudio', async () => {
				const { CartoonStudioPanel } = await import('../../studio/CartoonStudioPanel.js');
				CartoonStudioPanel.install(olamApp);
			}),
			this.safeInstall('agentApi', async () => {
				const { AnimatorAgentInstaller } = await import(
					'../../ai/agent/AnimatorAgentInstaller.js'
				);
				AnimatorAgentInstaller.install(olamApp);
			})
		]);
	}

	/**
	 * Compatibility gateway for callers that still expect one complete extension pass.
	 * @param {object} olamApp Fully initialized Animator application.
	 * @returns {Promise<void>}
	 */
	static async installAll(olamApp) {
		await this.installPrimary(olamApp);
		await this.installSecondary(olamApp);
	}

	/**
	 * Isolates one asynchronous extension failure and records a stable health receipt.
	 * @param {string} shemExtension Stable extension identifier.
	 * @param {Function} mitzvahInstall Async installation callback.
	 * @returns {Promise<void>}
	 */
	static async safeInstall(shemExtension, mitzvahInstall) {
		try {
			await mitzvahInstall();
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
