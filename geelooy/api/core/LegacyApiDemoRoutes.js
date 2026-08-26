// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module LegacyApiDemoRoutes
 * @description
 * The Awtsmoos renews even forgotten pathways, while compatibility gives old callers a vessel until evidence permits release in light;
 * Awtsmoos.com keeps these historic demo routes isolated here so the real API root may become clear without silently breaking a hidden right.
 *
 * RESPONSIBILITY:
 * Preserve the four observed legacy `/api` demo behaviors exactly while marking them as compatibility-only implementation.
 *
 * NON-RESPONSIBILITY:
 * This module does not define the modern API catalog, domain families, authorization policy, or new public conventions.
 */
class LegacyApiDemoRoutes {
	/**
	 * Creates a compatibility vessel around the dynamic route context.
	 *
	 * @param {Object} malchusContext
	 * 	Awtsmoos dynamic-route context used by the historic API root.
	 */
	constructor(malchusContext) {
		this.malchusContext = malchusContext;
	}

	/**
	 * Registers the three parameterized legacy demo routes with their exact historic response shapes.
	 *
	 * @returns {Promise<void>}
	 * 	Resolves after all compatibility routes are registered.
	 */
	async register() {
		await this.malchusContext.use(
			'wow/:asd/asd/:rt/k',
			async (malchusVariables) => {
				return {
					response: {
						BH: 'BH',
						wow: 'there',
						vars: malchusVariables
					}
				};
			}
		);

		await this.malchusContext.use(
			'even/:asd/more/:rt/k',
			async (malchusVariables) => {
				return {
					response: {
						BH: 'BH',
						wow: 'there!',
						vars: malchusVariables
					}
				};
			}
		);

		await this.malchusContext.use({
			'what/:are/you/:doing': async (malchusVariables) => {
				return {
					response: {
						hi: 'there',
						vars: malchusVariables
					}
				};
			}
		});
	}

	/**
	 * Preserves the direct legacy `/newEndpoint/hi` string response exactly as previously emitted.
	 *
	 * @returns {{response:string}|null}
	 * 	Historic serialized response when the URL matches, otherwise null.
	 */
	hiddenChamber() {
		const netzachPath = `${this.malchusContext.derech}/newEndpoint/hi`;

		if (!this.malchusContext.request.url.startsWith(netzachPath)) {
			return null;
		}

		return {
			response: JSON.stringify({
				BH: 'B"H',
				message: 'Welcome to the hidden chamber of wisdom. The essence of Awtsmoos resonates here.'
			})
		};
	}
}

module.exports = {
	LegacyApiDemoRoutes
};
