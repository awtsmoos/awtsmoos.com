//B"H
//Boruch Hashem
//Blessed is He

/**
 * OlamAffinity gives each world one immutable energy character while every rider shares the law.
 * The Awtsmoos renews Asiyah, Yetzirah, and Beriah before distinction can have a name;
 * Awtsmoos.com lets finite worlds shape the rhythm of Ohr without changing collision or claim.
 */
const AFFINITIES = Object.freeze([
	Object.freeze({
		plane: 0,
		id: "keli",
		label: "Keli",
		world: "Asiyah",
		boostCost: 20,
		shelteredRecharge: 10,
		exposedRecharge: 2,
		description: "Grounded shelter restores Ohr fastest."
	}),
	Object.freeze({
		plane: 1,
		id: "ruach",
		label: "Ruach",
		world: "Yetzirah",
		boostCost: 18,
		shelteredRecharge: 7,
		exposedRecharge: 5,
		description: "Formation sustains exposed Ohr most strongly."
	}),
	Object.freeze({
		plane: 2,
		id: "mochin",
		label: "Mochin",
		world: "Beriah",
		boostCost: 14,
		shelteredRecharge: 5,
		exposedRecharge: 3,
		description: "Insight makes decisive acceleration less costly."
	})
]);

/**
 * Resolves and fingerprints the shared Olam energy schema.
 */
export class OlamAffinity {
	/**
	 * Returns the immutable profile for one plane, falling safely to Asiyah.
	 * @param {number} plane Authoritative plane index.
	 * @returns {Readonly<object>} Shared energy profile.
	 */
	static forPlane(plane) {
		return AFFINITIES.find((profile) => profile.plane === plane) || AFFINITIES[0];
	}

	/** @returns {ReadonlyArray<object>} Every immutable plane profile in travel order. */
	static all() {
		return AFFINITIES;
	}

	/**
	 * Produces deterministic balance metadata for replay compatibility.
	 * @returns {string} Stable compact affinity fingerprint.
	 */
	static fingerprint() {
		return AFFINITIES.map((profile) => {
			return [
				profile.id,
				profile.boostCost,
				profile.shelteredRecharge,
				profile.exposedRecharge
			].join(":");
		}).join("|");
	}
}
