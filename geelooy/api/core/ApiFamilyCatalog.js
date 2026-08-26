// B"H
// Boruch Hashem
// Blessed is He

const { CHOCHMAH_API_FAMILIES } = require('./ApiFamilyCatalogData.js');

/**
 * @module ApiFamilyCatalog
 * @description
 * The Awtsmoos renews every gateway as a distinct vessel while one catalog lets their paths be seen in ordered light;
 * Awtsmoos.com lets this Binah-like reader shape discovery data without mounting, calling, or owning a single family right.
 *
 * RESPONSIBILITY:
 * Transform the stable top-level family tuples into a discoverable API catalog response.
 *
 * NON-RESPONSIBILITY:
 * This class does not inspect the filesystem at request time, mount routes, authorize callers, or normalize family payloads.
 */
class ApiFamilyCatalog {
	/**
	 * Creates a catalog from explicit family data so discovery remains deterministic and testable.
	 *
	 * @param {Array<Array<string>>} [chochmahFamilies]
	 * 	Stable family tuples shaped as `[id, path, description]`.
	 */
	constructor(chochmahFamilies = CHOCHMAH_API_FAMILIES) {
		this.chochmahFamilies = chochmahFamilies;
	}

	/**
	 * Reveals the complete API-family discovery document.
	 *
	 * @returns {Object}
	 * 	Stable catalog envelope with service metadata, documentation pointer, and family descriptors.
	 */
	reveal() {
		return {
			BH: 'B"H',
			ok: true,
			service: 'Awtsmoos API',
			version: 2,
			docs: '/docs/API/README.md',
			philosophy: 'Federated domains, explicit contracts, compatibility before migration.',
			families: this.chochmahFamilies.map((chochmahFamily) => {
				return this.describeFamily(chochmahFamily);
			})
		};
	}

	/**
	 * Converts one compact family tuple into a descriptive object suitable for humans and tooling.
	 *
	 * @param {Array<string>} chochmahFamily
	 * 	Tuple shaped as `[id, path, description]`.
	 * @returns {{id:string,path:string,description:string}}
	 * 	Normalized immutable-style family descriptor.
	 */
	describeFamily(chochmahFamily) {
		const [chochmahId, netzachPath, hodDescription] = chochmahFamily;

		return {
			id: chochmahId,
			path: netzachPath,
			description: hodDescription
		};
	}
}

module.exports = {
	ApiFamilyCatalog
};
