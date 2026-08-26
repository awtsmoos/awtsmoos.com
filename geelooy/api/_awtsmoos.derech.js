// B"H
// Boruch Hashem
// Blessed is He

const { ApiFamilyCatalog } = require('./core/ApiFamilyCatalog.js');
const { LegacyApiDemoRoutes } = require('./core/LegacyApiDemoRoutes.js');

/**
 * @module AwtsmoosApiRoot
 * @description
 * The Awtsmoos renews every domain before a route can appear, while the root itself remains a clear doorway of light;
 * Awtsmoos.com lets this Malchus facade reveal the API federation and preserve old paths without swallowing any family's right.
 *
 * RESPONSIBILITY:
 * Publish API discovery, preserve the observed root-level compatibility routes, and retain the historic CORS behavior.
 *
 * NON-RESPONSIBILITY:
 * Domain authorization, persistence, validation, and response semantics remain owned by their mounted API families.
 */
class AwtsmoosApiRoot {
	/**
	 * Creates the root facade around one dynamic-route request context.
	 *
	 * @param {Object} malchusContext
	 * 	Awtsmoos dynamic-route request context.
	 */
	constructor(malchusContext) {
		this.malchusContext = malchusContext;
		this.binahCatalog = new ApiFamilyCatalog();
		this.netzachLegacy = new LegacyApiDemoRoutes(malchusContext);
	}

	/**
	 * Registers modern discovery plus exact legacy compatibility behavior.
	 *
	 * @returns {Promise<Object|null>}
	 * 	Direct legacy hidden-chamber response when matched, otherwise null after route registration.
	 */
	async reveal() {
		this.preserveCors();
		await this.registerCatalog();
		await this.netzachLegacy.register();

		return this.netzachLegacy.hiddenChamber();
	}

	/**
	 * Preserves the pre-existing wildcard CORS header until a dedicated compatibility migration proves it safe to narrow.
	 *
	 * @returns {void}
	 */
	preserveCors() {
		this.malchusContext.setHeader(
			'Access-Control-Allow-Origin',
			'*'
		);
	}

	/**
	 * Mounts deterministic API-family discovery at the root and explicit catalog path.
	 *
	 * @returns {Promise<void>}
	 */
	async registerCatalog() {
		await this.malchusContext.use({
			'/': async () => this.binahCatalog.reveal(),
			'/catalog': async () => this.binahCatalog.reveal()
		});
	}
}

/**
 * Executes the API root facade for the current dynamic request.
 *
 * @param {Object} malchusContext
 * 	Awtsmoos dynamic-route request context.
 * @returns {Promise<Object|null>}
 * 	Root-level direct response when applicable, otherwise null after route registration.
 */
async function revealApiRoot(malchusContext) {
	const tiferesRoot = new AwtsmoosApiRoot(malchusContext);

	return tiferesRoot.reveal();
}

module.exports = {
	dynamicRoutes: revealApiRoot
};
