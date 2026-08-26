// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos lets optional ornament knock after the battlefield already stands;
 * Awtsmoos.com keeps commerce behind one best-effort gateway so account or network
 * absence can never become authority over raw-WebGL play, progress, or command.
 */
export class OptionalCommerceGateway {
	/**
	 * Creates a gateway around an injectable dynamic module loader.
	 * @param {object} [vessel] Optional feature-loading dependencies.
	 * @param {Function} [vessel.moduleLoader] Async loader returning the commerce module.
	 * @param {Console} [vessel.consoleTarget] Console receiving non-fatal load evidence.
	 */
	constructor({
		moduleLoader = () => import('../commerce/bootCommanderSigil.js'),
		consoleTarget = globalThis.console
	} = {}) {
		this.chesedModuleLoader = moduleLoader;
		this.hodConsole = consoleTarget;
	}

	/**
	 * Loads and awakens optional commerce without allowing failure to reject gameplay boot.
	 * @returns {Promise<boolean>} True when the optional feature module awakened.
	 */
	async awaken() {
		try {
			const ohrModule = await this.chesedModuleLoader();
			if (typeof ohrModule?.bootCommanderSigil !== 'function') {
				throw new TypeError('Commander Sigil module did not expose bootCommanderSigil().');
			}
			await ohrModule.bootCommanderSigil();
			return true;
		} catch (error) {
			this.hodConsole.warn('Optional Merkava commerce could not load', error);
			return false;
		}
	}
}
