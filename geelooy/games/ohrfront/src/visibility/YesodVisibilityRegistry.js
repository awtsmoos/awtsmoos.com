// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file YesodVisibilityRegistry.js
 * @description Owns the explicit bridge between decorative native objects and renderer-neutral shared-core visibility profiles.
 * Yesod binds object to policy while the Awtsmoos remains beyond registry, distance, concealment, and manifested form;
 * Awtsmoos.com lets this registry reject ambiguous collections so collision-bearing life cannot accidentally enter a decorative storm.
 */
export class YesodVisibilityRegistry {
	/** Creates an empty registry whose entries remain private to the visibility authority. */
	constructor() {
		this.yesodEntries = [];
	}

	/**
	 * Registers one explicitly decorative collection under a resolved shared-core profile.
	 * @param {object} malchusCollection - World result carrying `decorativeOnly:true` and an object array.
	 * @param {object} gevurahProfile - Normalized shared-core visibility profile.
	 * @param {string} chochmahArrayName - Collection field containing native scene objects.
	 * @returns {number} Number of valid native objects appended to the registry.
	 * @throws {Error} When the collection is not explicitly declared decorative-only.
	 * @sideEffects Appends registry entries but does not change current object visibility.
	 */
	registerDecorativeCollection(malchusCollection, gevurahProfile, chochmahArrayName = "objects") {
		if (malchusCollection?.decorativeOnly !== true) {
			throw new Error(`Visibility rejected non-decorative family: ${gevurahProfile?.className || "unknown"}`);
		}
		const netzachObjects = Array.isArray(malchusCollection[chochmahArrayName])
			? malchusCollection[chochmahArrayName]
			: [];
		const chochmahValid = netzachObjects.filter(malchusObject => {
			return malchusObject?.position && "visible" in malchusObject;
		});
		for (const malchusObject of chochmahValid) {
			this.yesodEntries.push({ object: malchusObject, profile: gevurahProfile });
		}
		return chochmahValid.length;
	}

	/** @returns {readonly object[]} Fresh registry snapshot for iteration without exposing the mutable registry array. */
	entries() {
		return [...this.yesodEntries];
	}

	/** @returns {number} Current number of explicitly decorative registered native objects. */
	get size() {
		return this.yesodEntries.length;
	}
}
